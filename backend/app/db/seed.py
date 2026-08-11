import logging
from datetime import datetime, timedelta
from app.db.mongodb import db_manager, save_mock_db
from app.core.config import settings
from app.core.security import hash_password

logger = logging.getLogger("uvicorn")

SAMPLE_MOVIES = [
    {
        "title": "Interstellar",
        "description": "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.",
        "genre": ["Sci-Fi", "Adventure", "Drama"],
        "duration_mins": 169,
        "release_date": "2014-11-07",
        "language": "English",
        "poster_url": "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
        "rating": 8.7,
        "is_active": True,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Inception",
        "description": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project.",
        "genre": ["Sci-Fi", "Action", "Thriller"],
        "duration_mins": 148,
        "release_date": "2010-07-16",
        "language": "English",
        "poster_url": "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=80",
        "rating": 8.8,
        "is_active": True,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Oppenheimer",
        "description": "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
        "genre": ["Biography", "Drama", "History"],
        "duration_mins": 180,
        "release_date": "2023-07-21",
        "language": "English",
        "poster_url": "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&auto=format&fit=crop&q=80",
        "rating": 8.9,
        "is_active": True,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Dune: Part Two",
        "description": "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
        "genre": ["Action", "Adventure", "Sci-Fi"],
        "duration_mins": 166,
        "release_date": "2024-03-01",
        "language": "English",
        "poster_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
        "rating": 8.6,
        "is_active": True,
        "created_at": datetime.utcnow()
    }
]

async def seed_database():
    """Seed initial Admin user, movies, and showtimes if collection is empty."""
    if db_manager.db is None:
        return
    
    try:
        # 1. Seed Admin User
        users_col = db_manager.db["users"]
        admin_exists = await users_col.find_one({"email": settings.ADMIN_EMAIL})
        if not admin_exists:
            admin_user = {
                "full_name": settings.ADMIN_FULL_NAME,
                "email": settings.ADMIN_EMAIL,
                "hashed_password": hash_password(settings.ADMIN_PASSWORD),
                "role": "admin",
                "created_at": datetime.utcnow()
            }
            await users_col.insert_one(admin_user)
            logger.info(f"Seeded Admin Account: {settings.ADMIN_EMAIL}")

        # 2. Seed Movies
        movies_col = db_manager.db["movies"]
        shows_col = db_manager.db["shows"]
        
        movie_count = await movies_col.count_documents({})
        if movie_count == 0:
            result = await movies_col.insert_many(SAMPLE_MOVIES)
            movie_ids = [str(x) for x in result.inserted_ids]
            logger.info(f"Seeded {len(movie_ids)} sample movies.")
            
            # 3. Seed Shows for each movie
            sample_shows = []
            now = datetime.utcnow()
            screen_names = ["Screen 1 (IMAX)", "Screen 2 (Dolby Atmos)", "Screen 3 (4DX)"]
            
            for index, movie_id in enumerate(movie_ids):
                for day_offset in range(1, 4):
                    show_date = now + timedelta(days=day_offset)
                    for hour in [14, 19]:
                        show_time_dt = show_date.replace(hour=hour, minute=0, second=0, microsecond=0)
                        sample_shows.append({
                            "movie_id": movie_id,
                            "screen_name": screen_names[index % len(screen_names)],
                            "show_time": show_time_dt.isoformat(),
                            "price_per_seat": 12.50 + (index * 2),
                            "total_seats": 60,
                            "rows": 6,
                            "cols": 10,
                            "booked_seats": ["A1", "A2"] if hour == 19 else [],
                            "created_at": datetime.utcnow()
                        })
            
            if sample_shows:
                await shows_col.insert_many(sample_shows)
                logger.info(f"Seeded {len(sample_shows)} sample showtimes across screens.")
        
        await save_mock_db()

    except Exception as e:
        logger.error(f"Error seeding database: {e}")
