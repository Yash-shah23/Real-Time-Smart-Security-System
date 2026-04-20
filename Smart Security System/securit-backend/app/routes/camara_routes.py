import os
import time
import cv2
import asyncio
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime
from fastapi.responses import StreamingResponse
from ultralytics import YOLO
from app.config.database import cameras_collection, zones_collection, logs_collection
from app.helpers.auth_handler import get_current_user

os.makedirs("static/snapshots", exist_ok=True)

router = APIRouter()
model = YOLO("yolov8n.pt")

# ✅ SETUP CAMERA + ZONE
@router.post("/setup-full")
async def setup_camera_and_zone(payload: dict, current_user: dict = Depends(get_current_user)):
    try:
        coords = payload["coords"]

        camera_data = {
            "user_id": current_user["id"],
            "name": payload["name"],
            "location": payload["location"],
            "stream_url": payload["stream_url"],
            "intruder_detected": False,
            "zone": {
                "name": "Restricted",
                "coordinates": coords,  # ✅ store normalized
            },
            "created_at": datetime.utcnow()
        }
        result = await cameras_collection.insert_one(camera_data)

        return {
            "status": "success",
            "camera_id": str(result.inserted_id)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ✅ GET ALL CAMERAS
@router.get("/all")
async def get_user_cameras(current_user: dict = Depends(get_current_user)):
    cursor = cameras_collection.find({"user_id": current_user["id"]})
    data = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        data.append(doc)
    return data


# ✅ GET SINGLE CAMERA
@router.get("/{camera_id}")
async def get_camera(camera_id: str):
    cam = await cameras_collection.find_one({"_id": ObjectId(camera_id)})
    if not cam:
        raise HTTPException(404, "Camera not found")
    cam["_id"] = str(cam["_id"])
    return cam


# ✅ STREAM
# async def generate_frames(camera_id: str):
#     cam = await cameras_collection.find_one({"_id": ObjectId(camera_id)})
#     if not cam:
#         return

#     zone = cam.get("zone", {})
#     coords = zone.get("coordinates", {})

#     cap = cv2.VideoCapture(cam["stream_url"])
#     cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

#     intruder_state = False

#     try:
#         while True:
#             success, frame = cap.read()

#             # ✅ FIX 1: Check frame FIRST
#             if not success or frame is None:
#                 await asyncio.sleep(0.1)
#                 continue

#             # ✅ NOW safe to use frame
#             h, w, _ = frame.shape

#             # ✅ SCALE ZONE (normalized → actual pixels)
#             zx1 = int(coords.get("x1", 0) * w)
#             zy1 = int(coords.get("y1", 0) * h)
#             zx2 = int(coords.get("x2", 0) * w)
#             zy2 = int(coords.get("y2", 0) * h)

#             # 🔍 YOLO detection
#             results = model.predict(frame, classes=[0], imgsz=320, verbose=False)
#             current_intrusion = False

#             for r in results:
#                 for box in r.boxes:
#                     x1, y1, x2, y2 = map(int, box.xyxy[0])
#                     cx, cy = (x1 + x2)//2, (y1 + y2)//2

#                     cv2.circle(frame, (cx, cy), 5, (0, 255, 0), -1)

#                     if zx1 < cx < zx2 and zy1 < cy < zy2:
#                         current_intrusion = True

#             # 🎨 draw zone
#             color = (0, 0, 255) if current_intrusion else (255, 0, 0)

#             if zx2 > 0 and zy2 > 0:
#                 cv2.rectangle(frame, (zx1, zy1), (zx2, zy2), color, 2)

#             # 🔄 update DB only if changed
#             if current_intrusion != intruder_state:
#                 intruder_state = current_intrusion
#                 await cameras_collection.update_one(
#                     {"_id": ObjectId(camera_id)},
#                     {"$set": {"intruder_detected": intruder_state}}
#                 )

#             # 📦 encode frame
#             ret, buffer = cv2.imencode('.jpg', frame)
#             if not ret:
#                 continue

#             yield (
#                 b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' +
#                 buffer.tobytes() +
#                 b'\r\n'
#             )

#             await asyncio.sleep(0.001)

#     finally:
#         cap.release()

async def generate_frames(camera_id: str):
    cam = await cameras_collection.find_one({"_id": ObjectId(camera_id)})
    if not cam: return

    zone = cam.get("zone", {})
    coords = zone.get("coordinates", {})
    zx1_n, zy1_n = float(coords.get("x1", 0)), float(coords.get("y1", 0))
    zx2_n, zy2_n = float(coords.get("x2", 0)), float(coords.get("y2", 0))

    cap = cv2.VideoCapture(cam["stream_url"])
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

    intruder_state = False # Track state
    last_log_time = 0

    try:
        while True:
            success, frame = cap.read()
            if not success:
                await asyncio.sleep(0.1)
                continue

            h, w, _ = frame.shape
            zx1, zy1, zx2, zy2 = int(zx1_n * w), int(zy1_n * h), int(zx2_n * w), int(zy2_n * h)

            # AI Inference
            results = model.predict(frame, conf=0.5, classes=[0], verbose=False, imgsz=320)
            currently_intruding = False
            
            for r in results:
                for box in r.boxes:
                    cx, cy = (int(box.xyxy[0][0]) + int(box.xyxy[0][2])) // 2, (int(box.xyxy[0][1]) + int(box.xyxy[0][3])) // 2
                    if zx2 > 0 and (zx1 < cx < zx2) and (zy1 < cy < zy2):
                        currently_intruding = True

            # STATE CHANGE LOGIC
            if currently_intruding != intruder_state:
                intruder_state = currently_intruding
                await cameras_collection.update_one(
                    {"_id": ObjectId(camera_id)},
                    {"$set": {"intruder_detected": intruder_state}}
                )

            # 30-Second Throttled Logging
            if currently_intruding and (time.time() - last_log_time > 30):
                timestamp = int(time.time())
                filename = f"static/snapshots/{camera_id}_{timestamp}.jpg"
                cv2.imwrite(filename, frame)
                
                await logs_collection.insert_one({
                    "camera_id": camera_id,
                    "location": cam.get("location"),
                    "snapshot_url": filename,
                    "message": "Intruder detected in zone",
                    "timestamp": datetime.utcnow()
                })
                last_log_time = time.time()
                print(f"📝 LOGGED: Event for {cam['name']}")

            # Draw & Yield
            color = (0, 0, 255) if currently_intruding else (0, 255, 0)
            if zx2 > 0: cv2.rectangle(frame, (zx1, zy1), (zx2, zy2), color, 2)
            
            ret, buffer = cv2.imencode('.jpg', frame)
            if ret:
                yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            await asyncio.sleep(0.001)
    finally:
        cap.release()
@router.get("/stream/{camera_id}")
async def video_feed(camera_id: str):
    # Do NOT await generate_frames here!
    return StreamingResponse(generate_frames(camera_id), media_type="multipart/x-mixed-replace; boundary=frame")


# ✅ STATUS
@router.get("/status/{camera_id}")
async def check_status(camera_id: str):
    cam = await cameras_collection.find_one({"_id": ObjectId(camera_id)})
    if not cam:
        raise HTTPException(404, "Camera not found")

    return {"intruder": cam.get("intruder_detected", False)}


@router.get("/logs/recent")
async def get_recent_logs(current_user: dict = Depends(get_current_user)):
    # Fetch only the last 10 logs
    cursor = logs_collection.find().sort("timestamp", -1).limit(10)
    logs = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        logs.append(doc)
    return logs

@router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    # 1. Active cameras (count docs for user)
    active_count = await cameras_collection.count_documents({"user_id": current_user["id"]})
    
    # 2. Threats today (logs from last 24h)
    start_of_day = datetime.utcnow() - timedelta(hours=24)
    threats = await logs_collection.count_documents({"timestamp": {"$gte": start_of_day}})
    
    return {
        "activeCameras": f"{active_count} / 05",
        "threats": threats,
        "inference": "12ms",
        "storage": "98.2%"
    }

@router.get("/logs/all")
async def get_all_logs(current_user: dict = Depends(get_current_user)):
    # Sort by newest first
    cursor = logs_collection.find({"camera_id": {"$exists": True}}).sort("timestamp", -1).limit(50)
    logs = []
    async for doc in cursor:
        logs.append({
            "id": str(doc["_id"]),
            "type": "intrusion", 
            "event": doc.get("message", "Intruder Alert"),
            "location": doc.get("location", "Unknown Zone"),
            "time": doc.get("timestamp").strftime("%Y-%m-%d %H:%M:%S"),
            "status": "Critical",
            # ✅ THIS WAS MISSING: Map the field name exactly
            "snapshot_url": doc.get("snapshot_url", None) 
        })
    return logs