from sqlalchemy import Column, Integer, String, Text, Numeric, SmallInteger, DateTime
from sqlalchemy.sql import func
from database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200), nullable=False, comment="对联标题/名称")
    description = Column(Text, comment="对联描述")
    price = Column(Numeric(10, 2), comment="价格")
    image_urls = Column(Text, comment="商品图片URL，多个用逗号分隔")
    video_url = Column(String(500), comment="书写演示视频URL")
    status = Column(SmallInteger, default=1, comment="状态：1-上架，0-下架")
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间")