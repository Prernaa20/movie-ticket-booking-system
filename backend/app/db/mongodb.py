import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = logging.getLogger("uvicorn")

class DatabaseManager:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

db_manager = DatabaseManager()

async def connect_to_mongo():
    """Establish connection to MongoDB Atlas database and create indexes."""
    try:
        logger.info(f"Connecting to MongoDB database: {settings.DATABASE_NAME}...")
        db_manager.client = AsyncIOMotorClient(settings.MONGODB_URL)
        db_manager.db = db_manager.client[settings.DATABASE_NAME]
        
        # Verify connection with ping
        await db_manager.client.admin.command('ping')
        logger.info("Successfully connected to MongoDB Atlas!")
        
        # Create unique indexes for data integrity
        await init_indexes()
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        # Allow offline / mock fallback if MongoDB Atlas is not yet configured by user
        logger.warning("Application proceeding in database-reconnecting mode.")

async def close_mongo_connection():
    """Gracefully close MongoDB connection."""
    if db_manager.client:
        logger.info("Closing MongoDB Atlas connection...")
        db_manager.client.close()
        logger.info("MongoDB connection closed.")

async def init_indexes():
    """Create essential MongoDB collection indexes."""
    if db_manager.db is None:
        return
    try:
        # Users collection: unique index on email
        await db_manager.db["users"].create_index("email", unique=True)
        
        # Bookings collection: unique index on booking_code
        await db_manager.db["bookings"].create_index("booking_code", unique=True)
        
        # Shows collection: index on movie_id and show_time
        await db_manager.db["shows"].create_index("movie_id")
        await db_manager.db["shows"].create_index("show_time")
        
        logger.info("MongoDB collection indexes created successfully.")
    except Exception as e:
        logger.warning(f"Index creation warning: {e}")

def get_database() -> AsyncIOMotorDatabase:
    """Dependency helper to get active MongoDB database instance."""
    return db_manager.db
