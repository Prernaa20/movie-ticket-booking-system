from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "CineMagic - Movie Ticket Booking API"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    
    # MongoDB Atlas settings
    MONGODB_URL: str = "mongodb://localhost:27017/movie_booking_db"
    DATABASE_NAME: str = "movie_booking_db"
    
    # JWT Security settings
    JWT_SECRET_KEY: str = "super_secret_jwt_key_for_cinepass_movie_booking_app_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # Admin Seed Credentials
    ADMIN_FULL_NAME: str = "System Admin"
    ADMIN_EMAIL: str = "admin@cinepass.com"
    ADMIN_PASSWORD: str = "AdminPassword123!"

    # Razorpay Payment Gateway Credentials (Test Keys)
    RAZORPAY_KEY_ID: str = "rzp_test_CinePassDemoKey123"
    RAZORPAY_KEY_SECRET: str = "SecretCinePassRazorpayDemoSecret123"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
