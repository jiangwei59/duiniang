from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Order, Product
from schemas import OrderCreate, OrderResponse, OrderListResponse, OrderStatusUpdate
from utils import get_current_seller, generate_order_no

router = APIRouter(prefix="/api/orders", tags=["订单"])

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    """创建预定订单（买家端）"""
    # 检查商品是否存在
    product = db.query(Product).filter(Product.id == order_data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="商品不存在")

    # 生成订单号
    order_no = generate_order_no()

    # 创建订单
    order = Order(
        order_no=order_no,
        product_id=order_data.product_id,
        buyer_name=order_data.buyer_name,
        buyer_phone=order_data.buyer_phone,
        buyer_address=order_data.buyer_address,
        custom_remark=order_data.custom_remark,
        status=0
    )

    db.add(order)
    db.commit()
    db.refresh(order)
    return OrderResponse.from_orm(order)

@router.get("/my", response_model=OrderListResponse)
def get_my_orders(
    phone: str = Query(..., description="买家手机号"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=100, description="每页数量"),
    db: Session = Depends(get_db)
):
    """查询我的订单（买家端）"""
    query = db.query(Order).filter(Order.buyer_phone == phone)
    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return OrderListResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[OrderResponse.from_orm(o) for o in orders]
    )

@router.get("", response_model=OrderListResponse)
def get_all_orders(
    status: Optional[int] = Query(None, description="状态筛选"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=100, description="每页数量"),
    db: Session = Depends(get_db),
    current_seller: str = Depends(get_current_seller)
):
    """获取所有订单（卖家端，需要登录）"""
    query = db.query(Order)

    if status is not None:
        query = query.filter(Order.status == status)

    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return OrderListResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[OrderResponse.from_orm(o) for o in orders]
    )

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_seller: str = Depends(get_current_seller)
):
    """获取订单详情（卖家端，需要登录）"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    return OrderResponse.from_orm(order)

@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    status_data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_seller: str = Depends(get_current_seller)
):
    """更新订单状态（卖家端，需要登录）"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")

    order.status = status_data.status
    db.commit()
    db.refresh(order)
    return OrderResponse.from_orm(order)