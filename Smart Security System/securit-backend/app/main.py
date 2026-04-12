import httpx
from fastapi import FastAPI, APIRouter, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
# Import your existing routers
from app.routes import user_routes, camara_routes 
from app.config.database import create_indexes
from app.routes import websocket_routes

app = FastAPI(
    title="Secure AI API",
    description="Backend architecture for real-time security surveillance system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- NEW VERIFICATION ENDPOINT ---
@app.get("/api/hardware/verify-stream")
async def verify_stream(url: str = Query(...)):
    """
    This is the missing route that caused the 404.
    It takes the URL from React and tries to ping your mobile.
    """
    try:
        async with httpx.AsyncClient() as client:
            # We try to reach the mobile IP
            response = await client.get(url, timeout=5.0)
            if response.status_code == 200:
                return {"status": "success", "message": "Handshake established"}
            else:
                raise HTTPException(status_code=400, detail="Mobile server reached but stream refused")
    except Exception as e:
        # This triggers if the phone is on a different WiFi or the IP is wrong
        raise HTTPException(status_code=404, detail=f"Could not reach {url}. Check Network.")

@app.get("/")
async def root():
    return {"status": "Active", "system": "SecureAI API is running optimally."}

@app.on_event("startup")
async def startup():
    await create_indexes()


# Register your routers (Assuming they are imported correctly)
app.include_router(user_routes.router, prefix="/api/users", tags=["Authentication"])
app.include_router(camara_routes.router, prefix="/api/cameras", tags=["Camera Feed"])
app.include_router(websocket_routes.router)