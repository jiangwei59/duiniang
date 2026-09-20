from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Product
from schemas import ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
from utils import get_current_seller

router = APIRouter(prefix="/api/products", tags=["商品"])

@router.get("", response_model=ProductListResponse)
def get_products(
    status: Optional[int] = Query(None, description="状态筛选：1-上架，0-下架"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=100, description="每页数量"),
    db: Session = Depends(get_db)
):
    """获取商品列表（买家端）"""
    query = db.query(Product)

    if status is not None:
        query = query.filter(Product.status == status)
    else:
        # 买家端默认只显示上架商品
        query = query.filter(Product.status == 1)

    total = query.count()
    products = query.order_by(Product.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return ProductListResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[ProductResponse.from_orm(p) for p in products]
    )

@router.get("/all", response_model=ProductListResponse)
def get_all_products(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=100, description="每页数量"),
    db: Session = Depends(get_db),
    current_seller: str = Depends(get_current_seller)
):
    """获取所有商品（卖家端，需要登录）"""
    query = db.query(Product)
    total = query.count()
    products = query.order_by(Product.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return ProductListResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[ProductResponse.from_orm(p) for p in products]
    )

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """获取商品详情"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="商品不存在")
    return ProductResponse.from_orm(product)

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_seller: str = Depends(get_current_seller)
):
    """创建商品（卖家端，需要登录）"""
    product = Product(**product_data.dict())
    db.add(product)
    db.commit()
    db.refresh(product)
    return ProductResponse.from_orm(product)

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    current_seller: str = Depends(get_current_seller)
):
    """更新商品（卖家端，需要登录）"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="商品不存在")

    update_data = product_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return ProductResponse.from_orm(product)

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_seller: str = Depends(get_current_seller)
):
    """删除商品（卖家端，需要登录）"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="商品不存在")

    db.delete(product)
    db.commit()
    return None