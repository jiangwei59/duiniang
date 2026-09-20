from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Seller
from schemas import SellerLogin, TokenResponse
from utils import verify_password, create_access_token
from config import settings

router = APIRouter(prefix="/api/auth", tags=["认证"])

@router.post("/login", response_model=TokenResponse)
def login(seller_data: SellerLogin, db: Session = Depends(get_db)):
    """卖家登录"""
    seller = db.query(Seller).filter(Seller.username == seller_data.username).first()
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误"
        )

    if not verify_password(seller_data.password, seller.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误"
        )

    access_token = create_access_token(
        data={"sub": seller.username},
        expires_delta=timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    )

    return TokenResponse(
        access_token=access_token,
        username=seller.username
    )