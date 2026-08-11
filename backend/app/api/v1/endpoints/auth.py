from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.db.mongodb import db_manager, save_mock_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.core.security import hash_password, verify_password, create_access_token
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register_user(user_in: UserCreate):
    """Register a new customer user account and return access token."""
    users_col = db_manager.db["users"]
    
    # 1. Check if email already exists
    existing_user = await users_col.find_one({"email": user_in.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
        
    # 2. Hash password and build user record
    new_user = {
        "full_name": user_in.full_name,
        "email": user_in.email.lower(),
        "hashed_password": hash_password(user_in.password),
        "role": "user",
        "created_at": datetime.utcnow()
    }
    
    # 3. Save to database
    result = await users_col.insert_one(new_user)
    user_id = str(result.inserted_id)
    await save_mock_db()
    
    # 4. Generate JWT access token
    access_token = create_access_token(subject=user_in.email.lower(), role="user")
    
    user_response = UserResponse(
        id=user_id,
        full_name=user_in.full_name,
        email=user_in.email.lower(),
        role="user",
        created_at=new_user["created_at"]
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )

@router.post("/login", response_model=Token)
async def login_user(user_in: UserLogin):
    """Authenticate user credentials and return access token."""
    users_col = db_manager.db["users"]
    
    # Find user by email
    user = await users_col.find_one({"email": user_in.email.lower()})
    if not user or not verify_password(user_in.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )
        
    user_id = str(user["_id"])
    access_token = create_access_token(subject=user["email"], role=user["role"])
    
    user_response = UserResponse(
        id=user_id,
        full_name=user["full_name"],
        email=user["email"],
        role=user["role"],
        created_at=user["created_at"]
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )

@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """Fetch profile information for currently authenticated user."""
    return UserResponse(
        id=str(current_user["_id"]),
        full_name=current_user["full_name"],
        email=current_user["email"],
        role=current_user["role"],
        created_at=current_user["created_at"]
    )
