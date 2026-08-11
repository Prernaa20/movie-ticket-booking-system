import math
from datetime import datetime
from typing import Optional
from bson import ObjectId
from fastapi import APIRouter, HTTPException, status, Query, Depends
from app.db.mongodb import db_manager, save_mock_db
from app.schemas.movie import MovieCreate, MovieUpdate, MovieResponse, PaginatedMovieResponse
from app.api.deps import get_current_admin_user

router = APIRouter()

def helper_movie_dict(movie: dict) -> MovieResponse:
    """Helper to convert MongoDB BSON document to Pydantic MovieResponse model."""
    return MovieResponse(
        id=str(movie["_id"]),
        title=movie["title"],
        description=movie["description"],
        genre=movie.get("genre", []),
        duration_mins=movie.get("duration_mins", 120),
        release_date=movie.get("release_date", ""),
        language=movie.get("language", "English"),
        poster_url=movie.get("poster_url", ""),
        trailer_url=movie.get("trailer_url", "https://www.youtube.com/watch?v=zSWdZVtXT7E"),
        rating=movie.get("rating", 0.0),
        is_active=movie.get("is_active", True),
        created_at=movie.get("created_at", datetime.utcnow())
    )

@router.get("", response_model=PaginatedMovieResponse)
async def list_movies(
    search: Optional[str] = Query(None, description="Case-insensitive title search string"),
    genre: Optional[str] = Query(None, description="Filter by movie genre (e.g. Sci-Fi)"),
    language: Optional[str] = Query(None, description="Filter by audio language (e.g. English)"),
    page: int = Query(1, ge=1, description="Page number starting at 1"),
    limit: int = Query(8, ge=1, le=200, description="Items per page")
):
    """Browse catalog of movies with search, multi-filter, and pagination."""
    movies_col = db_manager.db["movies"]
    query = {}
    
    # 1. Title search regex (case-insensitive)
    if search:
        query["title"] = {"$regex": search, "$options": "i"}
        
    # 2. Genre filter
    if genre and genre.strip():
        query["genre"] = {"$regex": genre, "$options": "i"}
        
    # 3. Language filter
    if language and language.strip():
        query["language"] = {"$regex": language, "$options": "i"}
        
    total = await movies_col.count_documents(query)
    skip = (page - 1) * limit
    total_pages = math.ceil(total / limit) if total > 0 else 1
    
    cursor = movies_col.find(query).sort("created_at", -1).skip(skip).limit(limit)
    raw_movies = await cursor.to_list(length=limit)
    
    items = [helper_movie_dict(m) for m in raw_movies]
    
    return PaginatedMovieResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/{movie_id}", response_model=MovieResponse)
async def get_movie(movie_id: str):
    """Get details of a single movie by ID."""
    movies_col = db_manager.db["movies"]
    if not ObjectId.is_valid(movie_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Movie ID format."
        )
        
    movie = await movies_col.find_one({"_id": ObjectId(movie_id)})
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie not found."
        )
        
    return helper_movie_dict(movie)

@router.post("", response_model=MovieResponse, status_code=status.HTTP_201_CREATED)
async def create_movie(
    movie_in: MovieCreate,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Create a new movie record (Admin restricted)."""
    movies_col = db_manager.db["movies"]
    
    new_movie = movie_in.model_dump()
    new_movie["created_at"] = datetime.utcnow()
    
    result = await movies_col.insert_one(new_movie)
    new_movie["_id"] = result.inserted_id
    await save_mock_db()
    
    return helper_movie_dict(new_movie)

@router.put("/{movie_id}", response_model=MovieResponse)
async def update_movie(
    movie_id: str,
    movie_in: MovieUpdate,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Update existing movie details (Admin restricted)."""
    movies_col = db_manager.db["movies"]
    if not ObjectId.is_valid(movie_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Movie ID format."
        )
        
    update_data = {k: v for k, v in movie_in.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid fields provided for update."
        )
        
    result = await movies_col.find_one_and_update(
        {"_id": ObjectId(movie_id)},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie not found."
        )
        
    await save_mock_db()
    return helper_movie_dict(result)

@router.delete("/{movie_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_movie(
    movie_id: str,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Delete movie and associated showtimes (Admin restricted)."""
    movies_col = db_manager.db["movies"]
    shows_col = db_manager.db["shows"]
    
    if not ObjectId.is_valid(movie_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Movie ID format."
        )
        
    result = await movies_col.delete_one({"_id": ObjectId(movie_id)})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie not found."
        )
        
    # Also delete associated shows for cleanliness
    await shows_col.delete_many({"movie_id": movie_id})
    await save_mock_db()
    return None
