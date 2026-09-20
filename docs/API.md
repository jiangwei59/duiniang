# 对联预定售卖系统 API 接口文档

## 基础信息

- 基础URL: `https://your-render-app.onrender.com`
- 数据格式: JSON
- 认证方式: Bearer Token（JWT）

---

## 一、认证接口

### 1.1 卖家登录

**POST** `/api/auth/login`

请求参数：
```json
{
    "username": "admin",
    "password": "admin123"
}
```

响应：
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "username": "admin"
}
```

---

## 二、商品接口

### 2.1 获取商品列表（买家端）

**GET** `/api/products`

查询参数：
- `page`: 页码（默认1）
- `page_size`: 每页数量（默认10）

响应：
```json
{
    "total": 10,
    "page": 1,
    "page_size": 10,
    "items": [
        {
            "id": 1,
            "title": "新春对联",
            "description": "手写春联，红纸金字",
            "price": 58.00,
            "image_urls": "/uploads/images/xxx.jpg,/uploads/images/yyy.jpg",
            "video_url": "https://v.example.com/xxx.mp4",
            "status": 1,
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00"
        }
    ]
}
```

### 2.2 获取所有商品（卖家端）

**GET** `/api/products/all`

需要认证：是

查询参数：
- `page`: 页码
- `page_size`: 每页数量

### 2.3 获取商品详情

**GET** `/api/products/{product_id}`

响应：
```json
{
    "id": 1,
    "title": "新春对联",
    "description": "手写春联，红纸金字",
    "price": 58.00,
    "image_urls": "/uploads/images/xxx.jpg",
    "video_url": "https://v.example.com/xxx.mp4",
    "status": 1,
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
}
```

### 2.4 创建商品

**POST** `/api/products`

需要认证：是

请求参数：
```json
{
    "title": "新春对联",
    "description": "手写春联，红纸金字",
    "price": 58.00,
    "image_urls": "/uploads/images/xxx.jpg",
    "video_url": "https://v.example.com/xxx.mp4",
    "status": 1
}
```

### 2.5 更新商品

**PUT** `/api/products/{product_id}`

需要认证：是

请求参数（只需传需要更新的字段）：
```json
{
    "title": "更新后的标题",
    "price": 68.00
}
```

### 2.6 删除商品

**DELETE** `/api/products/{product_id}`

需要认证：是

---

## 三、订单接口

### 3.1 创建订单（买家端）

**POST** `/api/orders`

请求参数：
```json
{
    "product_id": 1,
    "buyer_name": "张三",
    "buyer_phone": "13800138000",
    "buyer_address": "北京市朝阳区xxx街道xxx号",
    "custom_remark": "请用楷书书写"
}
```

响应：
```json
{
    "id": 1,
    "order_no": "DL20240101120000ABCD1234",
    "product_id": 1,
    "product_title": "新春对联",
    "buyer_name": "张三",
    "buyer_phone": "13800138000",
    "buyer_address": "北京市朝阳区xxx街道xxx号",
    "custom_remark": "请用楷书书写",
    "status": 0,
    "created_at": "2024-01-01T12:00:00",
    "updated_at": "2024-01-01T12:00:00"
}
```

### 3.2 查询我的订单（买家端）

**GET** `/api/orders/my`

查询参数：
- `phone`: 买家手机号（必填）
- `page`: 页码
- `page_size`: 每页数量

### 3.3 获取所有订单（卖家端）

**GET** `/api/orders`

需要认证：是

查询参数：
- `status`: 订单状态筛选（0-待处理，1-处理中，2-已完成，3-已取消）
- `page`: 页码
- `page_size`: 每页数量

### 3.4 获取订单详情（卖家端）

**GET** `/api/orders/{order_id}`

需要认证：是

### 3.5 更新订单状态（卖家端）

**PUT** `/api/orders/{order_id}/status`

需要认证：是

请求参数：
```json
{
    "status": 2
}
```

状态值：
- `0`: 待处理
- `1`: 处理中
- `2`: 已完成
- `3`: 已取消

---

## 四、文件上传接口

### 4.1 上传图片

**POST** `/api/upload/image`

需要认证：是

请求格式：`multipart/form-data`

参数：
- `file`: 图片文件（支持 JPG、PNG、GIF、WebP，最大10MB）

响应：
```json
{
    "url": "/uploads/images/xxx.jpg",
    "filename": "xxx.jpg"
}
```

### 4.2 上传视频

**POST** `/api/upload/video`

需要认证：是

请求格式：`multipart/form-data`

参数：
- `file`: 视频文件（支持 MP4、WebM、OGG，最大50MB）

响应：
```json
{
    "url": "/uploads/videos/xxx.mp4",
    "filename": "xxx.mp4"
}
```

---

## 错误响应格式

```json
{
    "detail": "错误信息描述"
}
```

常见HTTP状态码：
- `200`: 成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未认证或认证失败
- `404`: 资源不存在
- `500`: 服务器内部错误