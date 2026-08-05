from fastapi import APIRouter
from app.api.v1.endpoints import auth

api_router = APIRouter()

# Include Auth Endpoint Router
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
