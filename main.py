from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from db import get_db_connection

app = FastAPI()

# 允许所有来源跨域（开发阶段）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 卖家登录
class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/api/login")
def login(req: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM seller WHERE username=%s AND password=%s", (req.username, req.password))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=401, detail="账号或密码错误")
    return {"success": True, "message": "登录成功"}

# 获取全部对联商品
@app.get("/api/products")
def get_products():
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute("SELECT * FROM product ORDER BY id DESC")
    products = cursor.fetchall()
    conn.close()
    return products

# 获取单个商品详情
@app.get("/api/products/{product_id}")
def get_product(product_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute("SELECT * FROM product WHERE id=%s", (product_id,))
    product = cursor.fetchone()
    conn.close()
    if not product:
        raise HTTPException(status_code=404, detail="商品不存在")
    return product

# 新增商品
class ProductRequest(BaseModel):
    name: str
    price: float
    size: str = ""
    description: str = ""
    image_urls: str = ""
    video_url: str = ""
    stock: int = 0

@app.post("/api/products")
def create_product(req: ProductRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO product(name,price,size,description,image_urls,video_url,stock) VALUES(%s,%s,%s,%s,%s,%s,%s)",
        (req.name, req.price, req.size, req.description, req.image_urls, req.video_url, req.stock)
    )
    conn.commit()
    conn.close()
    return {"success": True}

# 提交预定订单
class OrderRequest(BaseModel):
    buyer_name: str
    buyer_phone: str
    buyer_address: str
    product_id: int
    custom_note: str = ""

@app.post("/api/orders")
def create_order(req: OrderRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO orders(buyer_name,buyer_phone,buyer_address,product_id,custom_note) VALUES(%s,%s,%s,%s,%s)",
        (req.buyer_name, req.buyer_phone, req.buyer_address, req.product_id, req.custom_note)
    )
    conn.commit()
    conn.close()
    return {"success": True, "message": "预定提交成功"}

# 获取全部订单
@app.get("/api/orders")
def get_orders():
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute("SELECT * FROM orders ORDER BY id DESC")
    orders = cursor.fetchall()
    conn.close()
    return orders

# 修改订单状态为预定完成
@app.put("/api/orders/{order_id}/complete")
def complete_order(order_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE orders SET status='预定完成' WHERE id=%s", (order_id,))
    conn.commit()
    conn.close()
    return {"success": True, "message": "已标记预定完成"}

@app.get("/")
def root():
    return {"message": "对联售卖系统后端运行中"}
