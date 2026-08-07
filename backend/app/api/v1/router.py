from fastapi import APIRouter
from app.api.v1.endpoints import auth, movies, shows, bookings, admin, payments

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(movies.router, prefix="/movies", tags=["Movies Catalog"])
api_router.include_router(shows.router, prefix="/shows", tags=["Showtimes & Seats"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["Bookings & Tickets"])
api_router.include_router(payments.router, prefix="/payments", tags=["Razorpay Payment Gateway"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Portal"])
