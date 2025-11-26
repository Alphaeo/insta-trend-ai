import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from app.db import get_db_client

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretdevkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing - using bcrypt with explicit SHA256 preprocessing to avoid 72-byte limit
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Bearer token
security = HTTPBearer()

# Pydantic models
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "user"  # user, admin

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    created_at: datetime
    is_active: bool

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Password utilities
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash with backward compatibility."""
    import hashlib
    
    # Try direct verification first (for passwords <= 72 bytes)
    if pwd_context.verify(plain_password, hashed_password):
        return True
    
    # If password is longer than 72 bytes, try with SHA256 hash
    if len(plain_password.encode('utf-8')) > 72:
        password_hash = hashlib.sha256(plain_password.encode('utf-8')).hexdigest()
        if pwd_context.verify(password_hash, hashed_password):
            return True
    
    # Fallback for old bcrypt hashes (backward compatibility)
    try:
        from passlib.context import CryptContext
        old_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return old_context.verify(plain_password, hashed_password)
    except:
        return False

def get_password_hash(password: str) -> str:
    """Hash a password with proper handling for long passwords."""
    import hashlib
    
    # If password is longer than 72 bytes, hash it with SHA256 first
    if len(password.encode('utf-8')) > 72:
        # Hash with SHA256 to get a fixed 32-byte hash, then encode as hex (64 chars)
        password_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()
        return pwd_context.hash(password_hash)
    else:
        return pwd_context.hash(password)

# JWT utilities
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[TokenData]:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        return TokenData(email=email)
    except JWTError:
        return None

# User utilities
def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get a user by email from MongoDB."""
    db = get_db_client()
    user = db.users.find_one({"email": email})
    if user:
        user["id"] = str(user["_id"])
        del user["_id"]
    return user

def create_user(user_data: UserCreate) -> Dict[str, Any]:
    """Create a new user in MongoDB."""
    db = get_db_client()
    
    # Check if user already exists
    existing_user = db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and create user
    hashed_password = get_password_hash(user_data.password)
    user_doc = {
        "email": user_data.email,
        "password": hashed_password,
        "full_name": user_data.full_name,
        "role": user_data.role,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = db.users.insert_one(user_doc)
    user_doc["id"] = str(result.inserted_id)
    del user_doc["_id"]
    del user_doc["password"]  # Don't return password
    return user_doc

def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate a user with email and password."""
    user = get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user["password"]):
        return None
    return user

# Dependency for getting current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Get the current authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_data = verify_token(credentials.credentials)
    if token_data is None:
        raise credentials_exception
    
    user = get_user_by_email(token_data.email)
    if user is None:
        raise credentials_exception
    
    # Remove password from user data
    if "password" in user:
        del user["password"]
    
    return user

# Dependency for getting current active user
async def get_current_active_user(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Get the current active user."""
    if not current_user.get("is_active", True):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Dependency for WebSocket authentication
async def get_current_user_ws(token: str) -> Optional[Dict[str, Any]]:
    """Get the current user from a WebSocket connection."""
    if not token:
        return None
    
    try:
        # Remove 'Bearer ' prefix if present
        if token.startswith('Bearer '):
            token = token[7:]
            
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
            
        # Get user from database
        db = get_db_client()
        user = db.users.find_one({"email": email, "is_active": True})
        if not user:
            return None
            
        # Convert ObjectId to string for JSON serialization
        user["id"] = str(user["_id"])
        return user
        
    except JWTError:
        return None
    except Exception as e:
        print(f"WebSocket auth error: {e}")
        return None

# Dependency for admin users
async def get_current_admin_user(current_user: Dict[str, Any] = Depends(get_current_active_user)) -> Dict[str, Any]:
    """Get the current admin user."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    return current_user
