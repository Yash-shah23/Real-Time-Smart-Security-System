from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from bson import ObjectId
from app.config.database import cameras_collection
import asyncio

router = APIRouter()

# Store active connections
active_connections = {}

@router.websocket("/ws/{camera_id}")
async def websocket_endpoint(websocket: WebSocket, camera_id: str):
    await websocket.accept()

    if camera_id not in active_connections:
        active_connections[camera_id] = []

    active_connections[camera_id].append(websocket)

    try:
        while True:
            # Send latest status every 500ms (lightweight)
            cam = await cameras_collection.find_one({"_id": ObjectId(camera_id)})

            if cam:
                await websocket.send_json({
                    "intruder": cam.get("intruder_detected", False)
                })

            await asyncio.sleep(0.5)

    except WebSocketDisconnect:
        active_connections[camera_id].remove(websocket)