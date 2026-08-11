from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends
from app.db.mongodb import db_manager
from app.schemas.booking import AdminDashboardStats
from app.schemas.user import UserResponse
from app.api.deps import get_current_admin_user
from app.api.v1.endpoints.bookings import enrich_booking_details

router = APIRouter()

@router.get("/dashboard", response_model=AdminDashboardStats)
async def get_admin_dashboard_metrics(current_admin: dict = Depends(get_current_admin_user)):
    """Fetch high-level analytics dashboard metrics (Admin Restricted)."""
    db = db_manager.db
    
    total_movies = await db["movies"].count_documents({})
    total_shows = await db["shows"].count_documents({})
    total_users = await db["users"].count_documents({})
    total_bookings = await db["bookings"].count_documents({})
    
    pipeline = [
        {"$match": {"status": "CONFIRMED"}},
        {"$group": {"_id": None, "total_revenue": {"$sum": "$total_amount"}}}
    ]
    revenue_result = await db["bookings"].aggregate(pipeline).to_list(length=1)
    total_revenue = round(float(revenue_result[0]["total_revenue"]), 2) if revenue_result else 0.0
    
    recent_cursor = db["bookings"].find().sort("created_at", -1).limit(5)
    recent_raw = await recent_cursor.to_list(length=5)
    recent_bookings = []
    for b in recent_raw:
        try:
            enriched = await enrich_booking_details(b)
            recent_bookings.append(enriched)
        except Exception:
            pass
    
    return AdminDashboardStats(
        total_revenue=total_revenue,
        total_bookings=total_bookings,
        total_movies=total_movies,
        total_shows=total_shows,
        total_users=total_users,
        recent_bookings=recent_bookings
    )

@router.get("/users")
async def list_all_registered_users(current_admin: dict = Depends(get_current_admin_user)):
    """Fetch list of all registered customer & admin user accounts (Admin Restricted)."""
    users_col = db_manager.db["users"]
    cursor = users_col.find({}).sort("created_at", -1)
    raw_users = await cursor.to_list(length=200)
    
    users = []
    for u in raw_users:
        email_val = str(u.get("email") or "user@cinepass.com")
        name_val = str(u.get("full_name") or email_val.split("@")[0].capitalize())
        role_val = str(u.get("role") or "user")
        created_val = u.get("created_at")
        
        if isinstance(created_val, datetime):
            created_str = created_val.isoformat()
        elif isinstance(created_val, str):
            created_str = created_val
        else:
            created_str = datetime.utcnow().isoformat()
            
        users.append({
            "id": str(u["_id"]),
            "full_name": name_val,
            "email": email_val,
            "role": role_val,
            "created_at": created_str
        })
    return users

