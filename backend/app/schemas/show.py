from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.schemas.movie import MovieResponse

class ShowCreate(BaseModel):
    movie_id: str
    screen_name: str = Field(..., example="Screen 1 (IMAX)")
    show_time: str = Field(..., example="2026-08-10T19:00:00")
    price_per_seat: float = Field(..., gt=0, example=12.50)
    total_seats: int = Field(default=60, gt=0)
    rows: int = Field(default=6, gt=0, example=6)
    cols: int = Field(default=10, gt=0, example=10)

class ShowResponse(BaseModel):
    id: str
    movie_id: str
    screen_name: str
    show_time: str
    price_per_seat: float
    total_seats: int
    rows: int
    cols: int
    booked_seats: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True

class ShowDetailResponse(ShowResponse):
    movie: Optional[MovieResponse] = None
