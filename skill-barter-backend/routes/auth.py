from fastapi import APIRouter, HTTPException, status
from datetime import datetime
import uuid

from models.user import UserCreate, UserLogin, UserResponse
from database import users_collection

router = APIRouter()

# ─────────────────────────────────────────────
# POST /auth/signup — Register a new user
# ─────────────────────────────────────────────
@router.post("/auth/signup", response_model=UserResponse, tags=["Auth"])
async def signup(user: UserCreate):
    print(f"DEBUG: Signup attempt for email: {user.email}")
    # Check if user already exists
    existing = users_collection.find_one({"email": user.email})
    if existing:
        print(f"DEBUG: Signup failed - email {user.email} already exists in DB")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    print(f"DEBUG: Creating new user: {user.user_name}")
    user_doc = {
        "_id": str(uuid.uuid4()),
        "user_name": user.user_name,
        "email": user.email,
        "password": user.password,
        "credits": 50,
        "created_at": datetime.utcnow().isoformat()
    }
    
    users_collection.insert_one(user_doc)
    print(f"DEBUG: User created successfully: {user.email}")
    # Normalize for frontend
    user_doc["id"] = user_doc["_id"]
    return user_doc

@router.post("/auth/login", tags=["Auth"])
async def login(user_data: UserLogin):
    print(f"DEBUG: Login attempt for email: {user_data.email}")
    user = users_collection.find_one({"email": user_data.email})
    
    if not user or user.get("password") != user_data.password:
        print(f"DEBUG: Login failed - invalid credentials for {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    print(f"DEBUG: Login successful for {user_data.email}")
    return {
        "message": "Login successful",
        "user": {
            "id": user["_id"],
            "user_name": user["user_name"],
            "email": user["email"],
            "credits": user.get("credits", 50)
        }
    }
@router.get("/auth/user/{user_id}", tags=["Auth"])
async def get_user_profile(user_id: str):
    user = users_collection.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user["_id"],
        "user_name": user["user_name"],
        "email": user["email"],
        "credits": user.get("credits", 50)
    }

