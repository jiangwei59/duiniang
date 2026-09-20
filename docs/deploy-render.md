# Render 后端部署指南

## 前置准备

1. 注册 [Render](https://render.com/) 账号
2. 准备好阿里云 RDS MySQL 数据库信息
3. 代码已推送到 GitHub/GitLab 仓库

---

## 部署步骤

### 1. 创建 Web Service

1. 登录 Render Dashboard
2. 点击 **New** → **Web Service**
3. 连接你的 GitHub/GitLab 仓库
4. 选择包含后端代码的仓库

### 2. 配置服务

填写以下信息：

| 配置项 | 值 |
|--------|-----|
| **Name** | duiniang-api（或自定义名称） |
| **Region** | 选择离你最近的区域（如 Singapore） |
| **Branch** | main（或你的主分支） |
| **Root Directory** | backend |
| **Runtime** | Python |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |

### 3. 配置环境变量

在 **Environment** 选项卡中添加以下环境变量：

```
DB_HOST=rm-bp123xjpzd5i0d4t9.mysql.rds.aliyuncs.com
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=duiniang_db
JWT_SECRET_KEY=your-random-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

**重要**：
- `JWT_SECRET_KEY` 请使用随机生成的强密钥
- 数据库密码请使用阿里云 RDS 的实际密码
- `DB_USER` 是在阿里云 RDS 中创建的数据库账号

### 4. 获取 Render 出口 IP

1. 部署完成后，进入服务详情页
2. 在 **Settings** → **Networking** 中可以看到出口 IP
3. 或者在 Shell 中运行：`curl ifconfig.me`

### 5. 配置阿里云 RDS 白名单

1. 登录阿里云控制台
2. 进入 RDS 实例详情
3. 左侧菜单选择 **数据安全性**
4. 选择 **白名单与安全组** 标签
5. 点击 **添加白名单**
6. 添加 Render 的出口 IP 地址

### 6. 验证部署

1. 访问 `https://your-app-name.onrender.com/` 应该看到欢迎信息
2. 访问 `https://your-app-name.onrender.com/docs` 可以看到 API 文档
3. 访问 `https://your-app-name.onrender.com/health` 检查健康状态

---

## 常见问题

### 1. 数据库连接失败

**问题**：`Can't connect to MySQL server`

**解决方案**：
- 检查 RDS 白名单是否包含 Render 出口 IP
- 检查数据库账号密码是否正确
- 检查 RDS 实例是否在运行状态

### 2. 服务休眠

**问题**：Render 免费版会在 15 分钟无请求后休眠

**解决方案**：
- 升级到付费版
- 使用定时任务（如 cron-job.org）每 10 分钟访问一次 `/health` 接口

### 3. 文件上传失败

**问题**：上传文件返回 413 错误

**解决方案**：
- 检查文件大小是否超过限制
- Render 免费版对请求体大小有限制
- 建议大文件使用外部存储（如阿里云 OSS）

### 4. CORS 跨域问题

**问题**：前端请求后端报跨域错误

**解决方案**：
- 确保后端已配置 CORS 中间件
- 生产环境建议限制 `allow_origins` 为具体域名

---

## 监控与日志

1. **查看日志**：在 Render Dashboard 的服务详情页，点击 **Logs** 标签
2. **监控指标**：在 **Metrics** 标签查看 CPU、内存使用情况
3. **自动部署**：推送到主分支会自动触发重新部署

---

## 更新部署

每次推送到主分支，Render 会自动重新部署。也可以在 Dashboard 手动触发：
1. 进入服务详情页
2. 点击 **Manual Deploy**
3. 选择 **Deploy latest commit**

---

## 本地测试

部署前建议本地测试：

```bash
# 安装依赖
pip install -r requirements.txt

# 创建 .env 文件
cp .env.example .env
# 编辑 .env 填入实际配置

# 运行服务
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 访问 http://localhost:8000/docs 查看 API 文档
```