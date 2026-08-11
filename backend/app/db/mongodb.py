import json
import os
import logging
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from mongomock_motor import AsyncMongoMockClient
from app.core.config import settings

logger = logging.getLogger("uvicorn")
DB_FILE_PATH = os.path.join(os.path.dirname(__file__), "mock_db_store.json")

class DatabaseManager:
    client = None
    db = None
    is_mock: bool = False

db_manager = DatabaseManager()

def _bson_encoder(obj):
    if isinstance(obj, datetime):
        return {"$date": obj.isoformat()}
    if isinstance(obj, ObjectId):
        return {"$oid": str(obj)}
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

def _bson_decoder(dct):
    if "$date" in dct:
        try:
            return datetime.fromisoformat(dct["$date"])
        except Exception:
            return datetime.utcnow()
    if "$oid" in dct:
        try:
            return ObjectId(dct["$oid"])
        except Exception:
            return dct["$oid"]
    return dct

async def save_mock_db():
    """Save in-memory MongoDB store state to local JSON file to persist users across restarts."""
    if not db_manager.is_mock or db_manager.db is None:
        return
    try:
        store = {}
        for coll in ["users", "movies", "shows", "bookings"]:
            cursor = db_manager.db[coll].find({})
            docs = await cursor.to_list(length=10000)
            store[coll] = docs
        with open(DB_FILE_PATH, "w", encoding="utf-8") as f:
            json.dump(store, f, default=_bson_encoder, indent=2)
    except Exception as e:
        logger.warning(f"Could not persist mock DB state: {e}")

async def load_mock_db() -> bool:
    """Load persisted user accounts, bookings, and catalog from disk file into in-memory store."""
    if not db_manager.is_mock or db_manager.db is None or not os.path.exists(DB_FILE_PATH):
        return False
    try:
        with open(DB_FILE_PATH, "r", encoding="utf-8") as f:
            store = json.load(f, object_hook=_bson_decoder)
        for coll, docs in store.items():
            if docs:
                await db_manager.db[coll].delete_many({})
                await db_manager.db[coll].insert_many(docs)
        logger.info(f"Successfully loaded persistent dataset from {DB_FILE_PATH}")
        return True
    except Exception as e:
        logger.warning(f"Could not load mock DB state: {e}")
        return False

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
    await load_mock_db()

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
