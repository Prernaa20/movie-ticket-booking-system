from datetime import datetime
from typing import List
from bson import ObjectId
from fastapi import APIRouter, HTTPException, status, Depends
from app.db.mongodb import db_manager
from app.schemas.show import ShowCreate, ShowResponse, ShowDetailResponse
from app.schemas.movie import MovieResponse
from app.api.deps import get_current_admin_user
from app.api.v1.endpoints.movies import helper_movie_dict

router = APIRouter()

def helper_show_dict(show: dict) -> ShowResponse:
    """Helper to convert MongoDB BSON document to Pydantic ShowResponse model."""
    return ShowResponse(
        id=str(show["_id"]),
        movie_id=str(show["movie_id"]),
        screen_name=show["screen_name"],
        show_time=show["show_time"],
        price_per_seat=float(show["price_per_seat"]),
        total_seats=int(show.get("total_seats", 60)),
        rows=int(show.get("rows", 6)),
        cols=int(show.get("cols", 10)),
        booked_seats=show.get("booked_seats", []),
        created_at=show.get("created_at", datetime.utcnow())
    )

@router.post("", response_model=ShowResponse, status_code=status.HTTP_201_CREATED)
async def create_show(
    show_in: ShowCreate,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Schedule a new showtime for a movie (Admin restricted)."""
    movies_col = db_manager.db["movies"]
    shows_col = db_manager.db["shows"]
    
    # 1. Verify movie exists
    if not ObjectId.is_valid(show_in.movie_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Movie ID format."
        )
        
    movie = await movies_col.find_one({"_id": ObjectId(show_in.movie_id)})
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Referenced movie does not exist."
        )
        
    new_show = show_in.model_dump()
    new_show["booked_seats"] = []
    new_show["created_at"] = datetime.utcnow()
    
    result = await shows_col.insert_one(new_show)
    new_show["_id"] = result.inserted_id
    
    return helper_show_dict(new_show)

@router.get("/movie/{movie_id}", response_model=List[ShowResponse])
async def list_shows_for_movie(movie_id: str):
    """Fetch all scheduled showtimes for a specific movie."""
    shows_col = db_manager.db["shows"]
    
    cursor = shows_col.find({"movie_id": movie_id}).sort("show_time", 1)
    raw_shows = await cursor.to_list(length=100)
    
    return [helper_show_dict(s) for s in raw_shows]

@router.get("/{show_id}", response_model=ShowDetailResponse)
async def get_show_details(show_id: str):
    """Fetch complete showtime details including seat matrix layout and booked seats."""
    shows_col = db_manager.db["shows"]
    movies_col = db_manager.db["movies"]
    
    if not ObjectId.is_valid(show_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Show ID format."
        )
        
    show = await shows_col.find_one({"_id": ObjectId(show_id)})
    if not show:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Showtime not found."
        )
        
    movie_obj = None
    if ObjectId.is_valid(show["movie_id"]):
        movie = await movies_col.find_one({"_id": ObjectId(show["movie_id"])})
        if movie:
            movie_obj = helper_movie_dict(movie)
            
    show_resp = helper_show_dict(show)
    return ShowDetailResponse(
        **show_resp.model_dump(),
        movie=movie_obj
    )
