import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from mongomock_motor import AsyncMongoMockClient
from app.core.config import settings

logger = logging.getLogger("uvicorn")

class DatabaseManager:
    client = None
    db = None
    is_mock: bool = False

db_manager = DatabaseManager()

async def connect_to_mongo():
    """Establish connection to MongoDB Atlas database with fallback to in-memory async database."""
    # Check if placeholder URL is present in .env
    is_placeholder_url = "cluster0.mongodb.net" in settings.MONGODB_URL or "username" in settings.MONGODB_URL

    if not is_placeholder_url:
        try:
            logger.info(f"Connecting to MongoDB database: {settings.DATABASE_NAME}...")
            db_manager.client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=3000)
            db_manager.db = db_manager.client[settings.DATABASE_NAME]
            
            # Verify connection with ping
            await db_manager.client.admin.command('ping')
            logger.info("Successfully connected to MongoDB Atlas!")
            db_manager.is_mock = False
            await init_indexes()
            return
        except Exception as e:
            logger.warning(f"Could not connect to external MongoDB server ({e}).")

    # Fallback: Initialize In-Memory MongoDB Store using mongomock-motor
    logger.info("Initializing In-Memory Async MongoDB Store (mongomock)...")
    db_manager.client = AsyncMongoMockClient()
    db_manager.db = db_manager.client[settings.DATABASE_NAME]
    db_manager.is_mock = True
    logger.info("In-Memory Async MongoDB database initialized cleanly!")
    await init_indexes()

async def close_mongo_connection():
    """Gracefully close MongoDB connection."""
    if db_manager.client and not db_manager.is_mock:
        logger.info("Closing MongoDB Atlas connection...")
        db_manager.client.close()
        logger.info("MongoDB connection closed.")

async def init_indexes():
    """Create essential MongoDB collection indexes."""
    if db_manager.db is None:
        return
    try:
        await db_manager.db["users"].create_index("email", unique=True)
        await db_manager.db["bookings"].create_index("booking_code", unique=True)
        await db_manager.db["shows"].create_index("movie_id")
        await db_manager.db["shows"].create_index("show_time")
        logger.info("MongoDB collection indexes created successfully.")
    except Exception as e:
        logger.warning(f"Index creation notice: {e}")

def get_database() -> AsyncIOMotorDatabase:
    return db_manager.db
