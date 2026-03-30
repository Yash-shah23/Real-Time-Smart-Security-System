from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import user_routes, camara_routes

# Initialize the application
app = FastAPI(
    title="Secure AI API",
    description="Backend architecture for real-time security surveillance system",
    version="1.0.0"
)

# Configure CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"], # Add your React ports here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint check
@app.get("/")
async def root():
    return {"status": "Active", "system": "SecureAI API is running optimally."}

    

# Register the routers
app.include_router(user_routes.router, prefix="/api/users", tags=["Authentication"]),
app.include_router(camara_routes.router, prefix="/api/cameras", tags=["Camara Feed"])

