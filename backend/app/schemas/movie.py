from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class MovieBase(BaseModel):
    title: str = Field(..., example="Interstellar")
    description: str = Field(..., example="A team of explorers travel through a wormhole in space...")
    genre: List[str] = Field(..., example=["Sci-Fi", "Adventure", "Drama"])
    duration_mins: int = Field(..., gt=0, example=169)
    release_date: str = Field(..., example="2014-11-07")
    language: str = Field(..., example="English")
    poster_url: str = Field(..., example="https://images.unsplash.com/photo-1534447677768-be436bb09401")
    rating: float = Field(..., ge=0.0, le=10.0, example=8.7)
    is_active: bool = True

class MovieCreate(MovieBase):
    pass

class MovieUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    genre: Optional[List[str]] = None
    duration_mins: Optional[int] = None
    release_date: Optional[str] = None
    language: Optional[str] = None
    poster_url: Optional[str] = None
    rating: Optional[float] = None
    is_active: Optional[bool] = None

class MovieResponse(MovieBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class PaginatedMovieResponse(BaseModel):
    items: List[MovieResponse]
    total: int
    page: int
    limit: int
    total_pages: int
