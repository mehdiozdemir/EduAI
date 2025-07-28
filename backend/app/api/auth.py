from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas, models
from app.database import get_db
from pydantic import BaseModel, EmailStr

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

@router.post("/login", response_model=schemas.User)
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
    
    return db_user

@router.post("/register", response_model=schemas.User)
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
    
    return db_user

@router.post("/logout")
def logout():
    """Logout endpoint - frontend will handle token removal"""
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=schemas.User)
def get_current_user(user_id: int, db: Session = Depends(get_db)):
    """Get current user profile"""
    # In a real app, you would get user_id from JWT token
    # For now, we'll accept it as a parameter
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return db_user

@router.put("/me", response_model=schemas.User)
def update_current_user(user_id: int, user_data: schemas.UserUpdate, db: Session = Depends(get_db)):
    """Update current user profile"""
    # In a real app, you would get user_id from JWT token
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user fields
    for key, value in user_data.dict(exclude_unset=True).items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    
    return db_user
