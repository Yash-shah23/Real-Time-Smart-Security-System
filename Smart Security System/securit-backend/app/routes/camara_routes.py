from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from datetime import datetime
from typing import Optional

from app.config.database import cameras_collection, zones_collection
from app.helpers.auth_handler import get_current_user
from fastapi.responses import StreamingResponse
import cv2
import asyncio
from ultralytics import YOLO

router = APIRouter()

# Load the AI model once at the top so it doesn't crash your RAM
model = YOLO("yolov8n.pt")

@router.post("/setup-full")
async def setup_camera_and_zone(payload: dict, current_user: dict = Depends(get_current_user)):
    try:
        # 1. Prepare Camera Data
        camera_data = {
            "user_id": current_user["id"],
            "name": payload["name"],
            "location": payload["location"],
            "stream_url": payload["stream_url"],
            "created_at": datetime.utcnow()
        }
        
        # 2. Insert Camera and get its _id
        cam_result = await cameras_collection.insert_one(camera_data)
        camera_id = str(cam_result.inserted_id)

        # 3. Prepare Zone Data (Linked to camera_id)
        zone_coords = payload["coords"]
        zone_data = {
            "camera_id": camera_id,
            "name": "Restricted Perimeter",
            "coordinates": {
                "x1": zone_coords["x1"],
                "y1": zone_coords["y1"],
                "x2": zone_coords["x2"],
                "y2": zone_coords["y2"]
            },
            "created_at": datetime.utcnow()
        }

        # 4. Insert Zone
        await zones_collection.insert_one(zone_data)

        return {
            "status": "success",
            "camera_id": camera_id,
            "message": "Node and Zone synchronized successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database sync failed: {str(e)}")


@router.get("/all")
async def get_user_cameras(current_user: dict = Depends(get_current_user)):
    # Fetch all cameras belonging to the logged-in user
    cursor = cameras_collection.find({"user_id": current_user["id"]})
    cameras = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        cameras.append(doc)
    return cameras


# --- THE AI CAMERA GENERATOR ---
# --- THE AI CAMERA GENERATOR ---
async def generate_frames(camera_id: str):
    # 1. Fetch the specific camera from MongoDB to get its stream_url
    cam = await cameras_collection.find_one({"_id": ObjectId(camera_id)})
    if not cam:
        print("ERROR: Camera not found in DB")
        return

    stream_url = cam.get("stream_url", "0")

    # 2. Decide between Laptop (0) or Mobile Phone (http://...)
    if stream_url == "0":
        video_source = 0  # Laptop built-in webcam
    else:
        video_source = stream_url  # Mobile phone IP stream

    # 3. Start the capture!
    cap = cv2.VideoCapture(video_source)
    
    if not cap.isOpened():
        print(f"ERROR: Could not open camera at {video_source}. Check Wi-Fi/URL!")
        return

    # Fetch zone coordinates once for this camera
    zone = await zones_collection.find_one({"camera_id": camera_id})
    zx1, zy1, zx2, zy2 = 0, 0, 0, 0
    if zone:
        coords = zone["coordinates"]
        zx1, zy1, zx2, zy2 = coords.get("x1", 0), coords.get("y1", 0), coords.get("x2", 0), coords.get("y2", 0)

    intruder_state = False

    while True:
        success, frame = cap.read()
        if not success:
            print("ERROR: Failed to grab frame.")
            break

        # Run YOLO on the frame (classes=[0] means humans only)
        results = model(frame, stream=True, verbose=False, classes=[0])
        currently_intruding = False
        
        for r in results:
            for box in r.boxes:
                # 1. AI found a human! Get their coordinates.
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
                
                # 2. Draw a dot on the human's center so you can see it on the React feed
                cv2.circle(frame, (cx, cy), 5, (0, 255, 0), -1)

                print(f"👀 Human detected at X:{cx}, Y:{cy} | Zone is {zx1},{zy1} to {zx2},{zy2}")

                # 3. Check if they are inside the zone
                if (zx1 < cx < zx2) and (zy1 < cy < zy2):
                    currently_intruding = True
                    print("🚨 HUMAN CROSSED THE PERIMETER! TRIGGERING ALARM!")
                    break 

        # --- DATABASE TRIGGER ---
        if currently_intruding != intruder_state:
            intruder_state = currently_intruding
            # Tell React the status has changed!
            await cameras_collection.update_one(
                {"_id": ObjectId(camera_id)},
                {"$set": {"intruder_detected": intruder_state}}
            )

        # Encode the OpenCV frame into a JPEG format
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        
        # Yield the frame in the standard MJPEG format
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
        # Yield control back to FastAPI so it doesn't freeze
        await asyncio.sleep(0.01) 
            
    cap.release()

# --- THE API ENDPOINT ---
@router.get("/stream/{camera_id}")
async def video_feed(camera_id: str):
    """
    Returns a continuous Motion-JPEG stream of the camera.
    """
    # Pass camera_id to the generator
    return StreamingResponse(
        generate_frames(camera_id), 
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


@router.get("/zone/{camera_id}")
async def get_zone(camera_id: str):
    zone = await zones_collection.find_one({"camera_id": camera_id})
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    zone["_id"] = str(zone["_id"])
    return zone


# 2. Check Intruder Status
@router.get("/status/{camera_id}")
async def check_status(camera_id: str):
    cam = await cameras_collection.find_one({"_id": ObjectId(camera_id)})
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    is_intruding = cam.get("intruder_detected", False)
    return {"intruder": is_intruding}