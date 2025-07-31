from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas, models
from app.schemas.user import PasswordChange
from app.database import get_db
from app.core.auth_deps import get_current_user
from app.models.user import User
from typing import List

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.get("/me", response_model=schemas.User)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Kullanıcının kendi profil bilgilerini getir"""
    return current_user

@router.put("/me", response_model=schemas.User)
def update_current_user_profile(
    user_update: schemas.UserUpdate, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Kullanıcının kendi profil bilgilerini güncelle"""
    # Sadece belirli alanların güncellenmesine izin ver
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Güvenlik: kritik alanları güncellemeye izin verme
    forbidden_fields = ['id', 'is_admin', 'created_at']
    for field in forbidden_fields:
        if field in update_data:
            del update_data[field]
    
    # Kullanıcı bilgilerini güncelle
    for key, value in update_data.items():
        if hasattr(current_user, key) and value is not None:
            setattr(current_user, key, value)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.delete("/me")
def delete_current_user_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Kullanıcının kendi hesabını sil"""
    # Kullanıcının kendi hesabını silmesine izin ver
    # Ancak admin hesabı kendini silemez
    if current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin hesabı silinemez"
        )
    
    # Hesabı pasif yap (hard delete yerine soft delete)
    current_user.is_active = False
    db.commit()
    
    return {"message": "Hesabınız başarıyla devre dışı bırakıldı"}

@router.post("/me/change-password")
def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Kullanıcının şifresini değiştir"""
    # Mevcut şifreyi doğrula
    if not current_user.verify_password(password_data.current_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mevcut şifre yanlış"
        )
    
    # Yeni şifreyi set et
    current_user.set_password(password_data.new_password)
    db.commit()
    
    return {"message": "Şifre başarıyla değiştirildi"}
