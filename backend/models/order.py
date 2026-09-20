from sqlalchemy import Column, Integer, String, Text, SmallInteger, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_no = Column(String(50), unique=True, nullable=False, comment="订单编号")
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, comment="商品ID")
    buyer_name = Column(String(50), nullable=False, comment="买家姓名")
    buyer_phone = Column(String(20), nullable=False, comment="买家手机号")
    buyer_address = Column(String(500), nullable=False, comment="收货地址")
    custom_remark = Column(Text, comment="自定义对联备注")
    status = Column(SmallInteger, default=0, comment="订单状态：0-待处理，1-处理中，2-已完成，3-已取消")
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间")