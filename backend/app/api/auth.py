from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas, models
from app.database import get_db
from app.core.auth_deps import create_access_token, get_current_user
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta

# Token response schema
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: schemas.User

# Login request schema
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Register request schema  
class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    first_name: str
    last_name: str
    password: str

router = APIRouter(
    prefix="/auth",
    tags=["authentication"]
)

@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """Login with email and password"""
    # Find user by email
    db_user = db.query(models.User).filter(
        models.User.email == credentials.email
    ).first()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Verify password
    if not db_user.verify_password(credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"user_id": db_user.id, "email": db_user.email}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user
    }

@router.post("/register", response_model=TokenResponse)
def register(user_data: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    db_user = db.query(models.User).filter(
        (models.User.username == user_data.username) | 
        (models.User.email == user_data.email)
    ).first()
    
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    # Create new user
    db_user = models.User(
        username=user_data.username,
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name
    )
    db_user.set_password(user_data.password)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create access token for new user
    access_token = create_access_token(
        data={"user_id": db_user.id, "email": db_user.email}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user
    }

@router.get("/me", response_model=schemas.User)
def get_current_user_profile(current_user: models.User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

@router.post("/logout")
def logout(current_user: models.User = Depends(get_current_user)):
    """Logout endpoint - validates token and returns logout confirmation"""
    return {
        "message": "Successfully logged out",
        "user": current_user.username,
        "timestamp": datetime.now().isoformat(),
        "instructions": "Please remove the token from client storage (localStorage, sessionStorage, etc.)"
    }
