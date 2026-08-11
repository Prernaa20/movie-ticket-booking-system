import random
import string
from datetime import datetime
from typing import List
from bson import ObjectId
from fastapi import APIRouter, HTTPException, status, Depends
from app.db.mongodb import db_manager, save_mock_db
from app.schemas.booking import BookingCreate, BookingResponse
from app.api.deps import get_current_user

router = APIRouter()

def generate_booking_code() -> str:
    """Generate a unique 8-character uppercase booking confirmation code (e.g. CP-8F2A9C)."""
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"CP-{random_str}"

async def enrich_booking_details(booking: dict) -> BookingResponse:
    """Helper to populate nested show and movie information inside booking response."""
    shows_col = db_manager.db["shows"]
    movies_col = db_manager.db["movies"]
    
    show_details = None
    movie_details = None
    
    if ObjectId.is_valid(booking.get("show_id", "")):
        show = await shows_col.find_one({"_id": ObjectId(booking["show_id"])})
        if show:
            show_details = {
                "id": str(show["_id"]),
                "screen_name": show["screen_name"],
                "show_time": show["show_time"],
                "price_per_seat": float(show["price_per_seat"])
            }
            if ObjectId.is_valid(show.get("movie_id", "")):
                movie = await movies_col.find_one({"_id": ObjectId(show["movie_id"])})
                if movie:
                    movie_details = {
                        "id": str(movie["_id"]),
                        "title": movie["title"],
                        "poster_url": movie.get("poster_url", ""),
                        "duration_mins": movie.get("duration_mins", 120),
                        "language": movie.get("language", "English")
                    }
                    
    return BookingResponse(
        id=str(booking["_id"]),
        booking_code=booking["booking_code"],
        user_id=str(booking["user_id"]),
        show_id=str(booking["show_id"]),
        seat_numbers=booking["seat_numbers"],
        total_amount=float(booking["total_amount"]),
        status=booking["status"],
        created_at=booking.get("created_at", datetime.utcnow()),
        show_details=show_details,
        movie_details=movie_details
    )

@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_in: BookingCreate,
    current_user: dict = Depends(get_current_user)
):
    """Atomically reserve selected seats for a show and generate booking ticket receipt."""
    shows_col = db_manager.db["shows"]
    bookings_col = db_manager.db["bookings"]
    
    # 1. Validate show_id
    if not ObjectId.is_valid(booking_in.show_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Show ID format."
        )
        
    show = await shows_col.find_one({"_id": ObjectId(booking_in.show_id)})
    if not show:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Showtime not found."
        )
        
    requested_seats = [seat.strip().upper() for seat in booking_in.seat_numbers if seat.strip()]
    if not requested_seats:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please select at least one valid seat."
        )
        
    # 2. ATOMIC SEAT ALLOCATION CONCURRENCY CHECK
    # Atomically add seats ONLY IF none of requested_seats exist in booked_seats
    updated_show = await shows_col.find_one_and_update(
        {
            "_id": ObjectId(booking_in.show_id),
            "booked_seats": {"$nin": requested_seats}
        },
        {
            "$addToSet": {"booked_seats": {"$each": requested_seats}}
        },
        return_document=True
    )
    
    if not updated_show:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seat allocation conflict! One or more selected seats have already been booked by another user."
        )
        
    # 3. Calculate total amount
    price = float(show.get("price_per_seat", 10.0))
    total_amount = round(price * len(requested_seats), 2)
    booking_code = generate_booking_code()
    
    # 4. Insert booking document
    new_booking = {
        "booking_code": booking_code,
        "user_id": str(current_user["_id"]),
        "show_id": str(booking_in.show_id),
        "seat_numbers": requested_seats,
        "total_amount": total_amount,
        "status": "CONFIRMED",
        "created_at": datetime.utcnow()
    }
    
    result = await bookings_col.insert_one(new_booking)
    new_booking["_id"] = result.inserted_id
    await save_mock_db()
    
    return await enrich_booking_details(new_booking)

@router.get("/my-bookings", response_model=List[BookingResponse])
async def get_my_bookings(current_user: dict = Depends(get_current_user)):
    """Fetch booking history for currently logged in customer."""
    bookings_col = db_manager.db["bookings"]
    
    cursor = bookings_col.find({"user_id": str(current_user["_id"])}).sort("created_at", -1)
    raw_bookings = await cursor.to_list(length=100)
    
    return [await enrich_booking_details(b) for b in raw_bookings]

@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking_details(
    booking_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Fetch details of a single ticket receipt by ID."""
    bookings_col = db_manager.db["bookings"]
    
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Booking ID format."
        )
        
    booking = await bookings_col.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking ticket not found."
        )
        
    # Security check: User can only view their own booking unless admin
    if booking["user_id"] != str(current_user["_id"]) and current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden."
        )
        
    return await enrich_booking_details(booking)

@router.post("/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Cancel an active booking and release reserved seats back to available pool."""
    bookings_col = db_manager.db["bookings"]
    shows_col = db_manager.db["shows"]
    
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Booking ID format."
        )
        
    booking = await bookings_col.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking ticket not found."
        )
        
    if booking["user_id"] != str(current_user["_id"]) and current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden."
        )
        
    if booking["status"] == "CANCELLED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This booking has already been cancelled."
        )
        
    # 1. Update booking status to CANCELLED
    updated_booking = await bookings_col.find_one_and_update(
        {"_id": ObjectId(booking_id)},
        {"$set": {"status": "CANCELLED"}},
        return_document=True
    )
    
    # 2. Release seats in shows collection using $pullAll
    if ObjectId.is_valid(booking["show_id"]):
        await shows_col.update_one(
            {"_id": ObjectId(booking["show_id"])},
            {"$pullAll": {"booked_seats": booking["seat_numbers"]}}
        )
        
    return await enrich_booking_details(updated_booking)
