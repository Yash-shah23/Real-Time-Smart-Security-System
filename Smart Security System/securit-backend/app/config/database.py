import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

# Initialize MongoDB Client
client = AsyncIOMotorClient(MONGO_URI)
db = client[DATABASE_NAME]

# Define Collections based on your architecture
users_collection = db.get_collection("users")
cameras_collection = db.get_collection("cameras")
zones_collection = db.get_collection("zones")
faces_collection = db.get_collection("known_faces")
logs_collection = db.get_collection("logs")
alerts_collection = db.get_collection("alerts")


async def create_indexes():
    await cameras_collection.create_index("user_id")
    await cameras_collection.create_index("intruder_detected")
    await cameras_collection.create_index([("user_id", 1), ("created_at", -1)])