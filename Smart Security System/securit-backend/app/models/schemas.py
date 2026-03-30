from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# --- 1. USERS COLLECTION ---
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(..., max_length=72, min_length=6)
    phone: str

class UserInDB(BaseModel):
    id: str = Field(alias="_id")
    name: str
    email: EmailStr
    password: str # Hashed
    phone: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

# --- 2. CAMERAS COLLECTION ---
class CameraModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    name: str
    location: str
    stream_url: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

# --- 3. ZONES COLLECTION ---
class Coordinates(BaseModel):
    x1: int
    y1: int
    x2: int
    y2: int

class ZoneModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    camera_id: str
    name: str
    coordinates: Coordinates

# --- 4. KNOWN FACES COLLECTION ---
class KnownFaceModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    name: str
    image_path: str

# --- 5. LOGS / EVENTS COLLECTION ---
class LogEventModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    camera_id: str
    zone_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    person_type: str # "known" or "unknown"
    person_name: Optional[str] = None
    snapshot_path: str
    status: str # "alert" or "safe"

# --- 6. ALERTS COLLECTION ---
class AlertModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    log_id: str
    message: str
    sent_via: str # "sms", "email", "push"
    status: str # "sent", "failed"
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# class ForgotPasswordRequest(BaseModel):
#     email: EmailStr

# class ResetPasswordUpdate(BaseModel):
#     token: str
#     new_password: str