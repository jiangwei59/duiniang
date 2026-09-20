# 本地联调测试说明

## 环境准备

### 1. Python 环境

确保已安装 Python 3.8+：

```bash
python --version
```

### 2. MySQL 环境

安装本地 MySQL 或使用 Docker：

```bash
# 使用 Docker 启动 MySQL
docker run -d \
  --name mysql-local \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=root123 \
  -e MYSQL_DATABASE=duiniang_db \
  mysql:8.0
```

### 3. 创建数据库和表

连接本地 MySQL，执行 `docs/database.sql` 中的建表语句。

---

## 后端启动

### 1. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 配置环境变量

复制环境变量示例文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置本地数据库连接：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root123
DB_NAME=duiniang_db
JWT_SECRET_KEY=local-test-secret-key
```

### 3. 启动服务

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

启动成功后访问：
- API 服务：http://localhost:8000
- API 文档：http://localhost:8000/docs
- 健康检查：http://localhost:8000/health

---

## 前端启动

### 1. 启动本地服务器

```bash
cd frontend

# 方式一：使用 Python
python -m http.server 8080

# 方式二：使用 Node.js
npx serve .

# 方式三：使用 VS Code Live Server 插件
```

### 2. 修改 API 地址

在开发环境下，需要将前端的 API 地址改为本地后端地址：

编辑以下文件，将 `API_BASE_URL` 改为 `http://localhost:8000`：

**买家端：**
- `frontend/buyer/app.js`
- `frontend/buyer/detail.js`
- `frontend/buyer/order.js`
- `frontend/buyer/query.js`

**卖家端：**
- `frontend/seller/login.html`
- `frontend/seller/products.js`
- `frontend/seller/orders.js`

```javascript
const API_BASE_URL = 'http://localhost:8000';
```

---

## 测试流程

### 1. 卖家登录测试

1. 访问 http://localhost:8080/seller/login.html
2. 使用默认账号登录：
   - 用户名：`admin`
   - 密码：`admin123`
3. 登录成功后应跳转到商品管理页

### 2. 商品管理测试

1. 点击"添加商品"
2. 填写商品信息：
   - 商品名称：测试对联
   - 描述：测试描述
   - 价格：58
   - 图片URL：（可留空或填写测试URL）
3. 点击保存
4. 验证商品列表中显示新商品

### 3. 买家浏览测试

1. 访问 http://localhost:8080/buyer/
2. 应能看到商品列表
3. 点击商品进入详情页
4. 验证商品信息显示正确

### 4. 预定下单测试

1. 在商品详情页点击"立即预定"
2. 填写预定信息：
   - 姓名：张三
   - 手机号：13800138000
   - 地址：测试地址
   - 备注：测试备注
3. 提交预定
4. 记录订单号

### 5. 订单查询测试

1. 访问 http://localhost:8080/buyer/query.html
2. 输入下单时的手机号：13800138000
3. 点击查询
4. 应能看到刚才的订单

### 6. 卖家订单管理测试

1. 访问 http://localhost:8080/seller/orders.html
2. 应能看到所有订单
3. 测试筛选功能
4. 测试修改订单状态

---

## 跨域问题处理

### 问题表现

前端请求后端时报错：
```
Access to fetch at 'http://localhost:8000/api/...' from origin 'http://localhost:8080' 
has been blocked by CORS policy
```

### 解决方案

**方案一：后端已配置 CORS（推荐）**

后端代码已配置允许跨域，确保 `main.py` 中有：
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**方案二：浏览器插件**

安装浏览器 CORS 插件：
- Chrome：[Allow CORS: Access-Control-Allow-Origin](https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkegdajnohaiihgle)
- Firefox：[CORS Everywhere](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/)

**方案三：代理服务器**

在 `backend/main.py` 添加静态文件服务：
```python
from fastapi.staticfiles import StaticFiles

# 挂载前端静态文件
app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")
```

然后访问 http://localhost:8000 即可同时访问前后端。

---

## 视频文件测试

### 本地视频测试

1. 创建视频目录：
```bash
mkdir -p backend/uploads/videos
```

2. 将测试视频放入目录

3. 使用卖家后台上传或填写本地路径：
```
/uploads/videos/test.mp4
```

### 外部视频测试

填写外部视频 URL，如：
```
https://www.example.com/video.mp4
```

---

## 数据库调试

### 查看数据

使用数据库客户端连接本地 MySQL：

```sql
-- 查看商品
SELECT * FROM products;

-- 查看订单
SELECT * FROM orders;

-- 查看卖家
SELECT * FROM sellers;
```

### 重置数据

```sql
-- 清空订单
TRUNCATE TABLE orders;

-- 清空商品
TRUNCATE TABLE products;

-- 重置管理员密码
UPDATE sellers SET password_hash = '$2b$12$LJ3m4ys3Lz0QJNi8N0uYAeJ8d8vKz3X9J9v8X8X8X8X8X8X8X8X8X8' WHERE username = 'admin';
```

---

## 常见问题

### 1. 数据库连接失败

**问题**：`Can't connect to MySQL server on 'localhost'`

**解决方案**：
- 确认 MySQL 服务已启动
- 检查端口是否正确（默认 3306）
- 检查用户名密码是否正确

### 2. 表不存在

**问题**：`Table 'duiniang_db.products' doesn't exist`

**解决方案**：
- 执行建表 SQL 语句
- 检查数据库名是否正确

### 3. 端口被占用

**问题**：`Address already in use`

**解决方案**：
```bash
# 查找占用端口的进程
netstat -ano | findstr :8000

# 终止进程
taskkill /PID <进程ID> /F

# 或使用其他端口
uvicorn main:app --port 8001
```

### 4. 模块导入错误

**问题**：`ModuleNotFoundError: No module named 'xxx'`

**解决方案**：
```bash
# 确保在 backend 目录下
cd backend

# 重新安装依赖
pip install -r requirements.txt
```

---

## 生产环境切换

测试完成后，切换到生产环境：

1. 恢复前端 API 地址为 Render 地址
2. 更新 `.env` 文件中的数据库配置为阿里云 RDS
3. 重新部署前后端