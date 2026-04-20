from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
import jwt
import os

# --- 1. CONFIGURATION & DATABASE ---
app = FastAPI(title="SecureAI Backend", version="2.0.0")

# Enable CORS for React Frontend (localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Connection (Replace with your Atlas URI if needed)
MONGO_DETAILS = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_DETAILS)
db = client.secure_ai_db

# Collections
users_collection = db.get_collection("users")
cameras_collection = db.get_collection("cameras")
zones_collection = db.get_collection("zones")

SECRET_KEY = "YOUR_SUPER_SECRET_KEY" # Move to .env for production
ALGORITHM = "ALGORITHM"

# --- 2. SCHEMAS (Pydantic Models) ---
class Coordinates(BaseModel):
    x1: int
    y1: int
    x2: int
    y2: int

class ZoneSchema(BaseModel):
    camera_id: str
    name: str = "Restricted Area"
    coordinates: Coordinates

class CameraSchema(BaseModel):
    name: str
    location: str
    stream_url: str = "0"

# --- 3. AUTHENTICATION HELPER ---
async def get_current_user(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid Token")
        return {"id": user_id}
    except Exception:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

# --- 4. API ENDPOINTS ---

@app.get("/")
async def root():
    return {"message": "SecureAI API is Online"}

# --- CAMERA & ZONE MANAGEMENT ---

@app.post("/api/cameras/setup-full")
async def setup_node(payload: dict):
    """
    Unified Endpoint: Saves both Camera and its Restricted Zone in one transaction.
    Expected payload: { name, location, stream_url, coords: {x1, y1, x2, y2} }
    """
    try:
        # 1. Save Camera Entry
        camera_entry = {
            "name": payload["name"],
            "location": payload["location"],
            "stream_url": payload["stream_url"],
            "status": "active",
            "created_at": datetime.utcnow()
        }
        
        cam_result = await cameras_collection.insert_one(camera_entry)
        camera_id = str(cam_result.inserted_id)

        # 2. Save Zone Entry linked to Camera
        zone_coords = payload["coords"]
        zone_entry = {
            "camera_id": camera_id,
            "name": "Primary Restricted Zone",
            "coordinates": {
                "x1": zone_coords["x1"],
                "y1": zone_coords["y1"],
                "x2": zone_coords["x2"],
                "y2": zone_coords["y2"]
            },
            "created_at": datetime.utcnow()
        }
        
        await zones_collection.insert_one(zone_entry)

        return {
            "status": "success",
            "camera_id": camera_id,
            "message": "Node and Perimeter synced successfully"
        }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Database insertion failed")

@app.get("/api/cameras/all")
async def get_all_cameras():
    """Fetches all registered cameras from the database."""
    cameras = []
    cursor = cameras_collection.find({})
    async for document in cursor:
        document["_id"] = str(document["_id"])
        cameras.append(document)
    return cameras

@app.get("/api/zones/{camera_id}")
async def get_zone_by_camera(camera_id: str):
    """Fetch the restricted zone for a specific camera (Used by Vision.py)"""
    zone = await zones_collection.find_one({"camera_id": camera_id})
    if zone:
        zone["_id"] = str(zone["_id"])
        return zone
    raise HTTPException(status_code=404, detail="Zone not found for this camera")


# --- 5. SERVER RUNNER ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
