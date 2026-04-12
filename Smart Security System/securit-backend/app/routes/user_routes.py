from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from bson import ObjectId
import uuid # Built-in for unique tokens

# Import our DB collection and schemas
from app.config.database import users_collection
from app.models.schemas import UserCreate
from app.helpers.auth_handler import get_password_hash, verify_password, create_access_token

router = APIRouter()

# --- Custom schema just for login requests ---
class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., max_length=72)

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    # 1. Check if user already exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # 2. Hash the password (truncate to 72 characters just to be safe)
    safe_password = user.password[:72]
    hashed_password = get_password_hash(safe_password)
    
    # 3. Prepare the MongoDB document
    user_dict = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password,
        "phone": user.phone,
        "created_at": datetime.utcnow()
    }
    
    # 4. Insert into Database
    result = await users_collection.insert_one(user_dict)
    
    return {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id)
    }
    

@router.post("/login")
async def login_user(user_credentials: UserLogin):
    # 1. Find the user by email
    user = await users_collection.find_one({"email": user_credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # 2. Verify the hashed password
    if not verify_password(user_credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # 3. Generate JWT Token
    access_token = create_access_token(data={"sub": user["email"], "id": str(user["_id"])})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "name": user["name"],
            "email": user["email"]
        }
    }

# @router.post("/forgot-password")
# async def forgot_password(request: ForgotPasswordRequest):
#     user = await users_collection.find_one({"email": request.email})
#     if not user:
#         # Security Tip: Don't reveal if email exists. Say "If email exists, a link was sent."
#         return {"message": "If this email is registered, a reset link has been sent."}
    
#     # Generate a unique token
#     reset_token = str(uuid.uuid4())
    
#     # Store token in User document with an expiry (e.g., 30 mins)
#     await users_collection.update_one(
#         {"email": request.email},
#         {"$set": {
#             "reset_token": reset_token,
#             "token_expiry": datetime.utcnow() + timedelta(minutes=30)
#         }}
#     )
    
#     # PRINT THE LINK (In production, send this via Email)
#     print(f"DEBUG: Reset Link -> http://localhost:3000/reset-password?token={reset_token}")
    
#     return {"message": "Reset link sent to your email."}

# @router.post("/reset-password")
# async def reset_password(data: ResetPasswordUpdate):
#     # 1. Find user by token and check if token is still valid (not expired)
#     user = await users_collection.find_one({
#         "reset_token": data.token,
#         "token_expiry": {"$gt": datetime.utcnow()}
#     })
    
#     if not user:
#         raise HTTPException(status_code=400, detail="Invalid or expired token")
    
#     # 2. Hash new password and update
#     new_hashed_password = get_password_hash(data.new_password)
#     await users_collection.update_one(
#         {"_id": user["_id"]},
#         {
#             "$set": {"password": new_hashed_password},
#             "$unset": {"reset_token": "", "token_expiry": ""} # Remove token after use
#         }
#     )
    
#     return {"message": "Password updated successfully. You can now login."}