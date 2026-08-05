from fastapi import APIRouter
from app.api.v1.endpoints import auth, movies, shows

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(movies.router, prefix="/movies", tags=["Movies Catalog"])
api_router.include_router(shows.router, prefix="/shows", tags=["Showtimes & Seats"])
