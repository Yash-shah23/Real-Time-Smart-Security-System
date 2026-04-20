import os
import bcrypt
from datetime import datetime, timedelta
from jose import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from dotenv import load_dotenv

# Load variables
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "YOUR_SUPER_SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# Safely parse the expire minutes
raw_expire = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
try:
    ACCESS_TOKEN_EXPIRE_MINUTES = int(raw_expire)
except ValueError:
    ACCESS_TOKEN_EXPIRE_MINUTES = 1440 

security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        return None

async def get_current_user(auth: HTTPAuthorizationCredentials = Security(security)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(auth.credentials)
    if payload is None or payload.get("id") is None:
        raise credentials_exception
    return {"id": payload.get("id")}