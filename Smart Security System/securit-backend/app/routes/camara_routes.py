from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime
from app.config.database import cameras_collection
from app.helpers.auth_handler import get_current_user
from fastapi.responses import StreamingResponse
import cv2
import asyncio
from ultralytics import YOLO

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
async def generate_frames(camera_id: str):
    cam = await cameras_collection.find_one({"_id": ObjectId(camera_id)})
    if not cam:
        return

    zone = cam.get("zone", {})
    coords = zone.get("coordinates", {})

    cap = cv2.VideoCapture(cam["stream_url"])
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

    intruder_state = False

    try:
        while True:
            success, frame = cap.read()

            # ✅ FIX 1: Check frame FIRST
            if not success or frame is None:
                await asyncio.sleep(0.1)
                continue

            # ✅ NOW safe to use frame
            h, w, _ = frame.shape

            # ✅ SCALE ZONE (normalized → actual pixels)
            zx1 = int(coords.get("x1", 0) * w)
            zy1 = int(coords.get("y1", 0) * h)
            zx2 = int(coords.get("x2", 0) * w)
            zy2 = int(coords.get("y2", 0) * h)

            # 🔍 YOLO detection
            results = model.predict(frame, classes=[0], imgsz=320, verbose=False)
            current_intrusion = False

            for r in results:
                for box in r.boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    cx, cy = (x1 + x2)//2, (y1 + y2)//2

                    cv2.circle(frame, (cx, cy), 5, (0, 255, 0), -1)

                    if zx1 < cx < zx2 and zy1 < cy < zy2:
                        current_intrusion = True

            # 🎨 draw zone
            color = (0, 0, 255) if current_intrusion else (255, 0, 0)

            if zx2 > 0 and zy2 > 0:
                cv2.rectangle(frame, (zx1, zy1), (zx2, zy2), color, 2)

            # 🔄 update DB only if changed
            if current_intrusion != intruder_state:
                intruder_state = current_intrusion
                await cameras_collection.update_one(
                    {"_id": ObjectId(camera_id)},
                    {"$set": {"intruder_detected": intruder_state}}
                )

            # 📦 encode frame
            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret:
                continue

            yield (
                b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' +
                buffer.tobytes() +
                b'\r\n'
            )

            await asyncio.sleep(0.001)

    finally:
        cap.release()

@router.get("/stream/{camera_id}")
async def video_feed(camera_id: str):
    return StreamingResponse(
        generate_frames(camera_id),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


# ✅ STATUS
@router.get("/status/{camera_id}")
async def check_status(camera_id: str):
    cam = await cameras_collection.find_one({"_id": ObjectId(camera_id)})
    if not cam:
        raise HTTPException(404, "Camera not found")

    return {"intruder": cam.get("intruder_detected", False)}