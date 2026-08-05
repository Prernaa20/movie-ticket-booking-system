from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class BookingCreate(BaseModel):
    show_id: str = Field(..., example="65b...123")
    seat_numbers: List[str] = Field(..., min_items=1, example=["A3", "A4"])

class BookingResponse(BaseModel):
    id: str
    booking_code: str
    user_id: str
    show_id: str
    seat_numbers: List[str]
    total_amount: float
    status: str = "CONFIRMED"
    created_at: datetime
    show_details: Optional[dict] = None
    movie_details: Optional[dict] = None

    class Config:
        from_attributes = True

class AdminDashboardStats(BaseModel):
    total_revenue: float
    total_bookings: int
    total_movies: int
    total_shows: int
    total_users: int
    recent_bookings: List[BookingResponse] = []
