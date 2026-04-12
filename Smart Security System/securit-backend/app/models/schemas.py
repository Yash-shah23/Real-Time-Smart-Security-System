from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# --- USERS ---
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(..., max_length=72, min_length=6)
    phone: str


class UserInDB(BaseModel):
    id: str = Field(alias="_id")
    name: str
    email: EmailStr
    password: str
    phone: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


# --- CAMERA WITH EMBEDDED ZONE ---
class Coordinates(BaseModel):
    x1: int
    y1: int
    x2: int
    y2: int


class Zone(BaseModel):
    name: str = "Restricted"
    coordinates: Coordinates
    frame_width: Optional[int] = None
    frame_height: Optional[int] = None


class CameraModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    name: str
    location: str
    stream_url: str
    zone: Optional[Zone] = None
    intruder_detected: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)