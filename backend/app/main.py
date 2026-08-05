from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.db.seed import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler managing MongoDB connections on startup and shutdown."""
    # Startup: Connect to MongoDB Atlas & Seed data
    await connect_to_mongo()
    await seed_database()
    yield
    # Shutdown: Close database connection
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Full-Stack Movie Ticket Booking System REST API built with FastAPI & MongoDB Atlas",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health", tags=["Health Check"])
async def health_check():
    """Verify backend API health status."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0"
    }
