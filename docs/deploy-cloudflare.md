# Cloudflare Pages 前端部署指南

## 前置准备

1. 注册 [Cloudflare](https://cloudflare.com/) 账号
2. 代码已推送到 GitHub/GitLab 仓库
3. 后端已部署到 Render

---

## 部署步骤

### 1. 创建 Pages 项目

1. 登录 Cloudflare Dashboard
2. 左侧菜单选择 **Workers & Pages**
3. 点击 **Create application**
4. 选择 **Pages** 标签
5. 点击 **Connect to Git**

### 2. 连接仓库

1. 选择你的 GitHub/GitLab 账号
2. 选择包含前端代码的仓库
3. 点击 **Begin setup**

### 3. 配置构建设置

填写以下信息：

| 配置项 | 值 |
|--------|-----|
| **Project name** | duiniang（或自定义名称） |
| **Production branch** | main（或你的主分支） |
| **Framework preset** | None |
| **Build command** | 留空（静态站点无需构建） |
| **Build output directory** | frontend |

### 4. 部署

点击 **Save and Deploy**，Cloudflare 会自动部署你的前端代码。

部署完成后，你会得到一个域名：`https://duiniang.pages.dev`

---

## 配置自定义域名（可选）

### 1. 添加自定义域名

1. 在 Pages 项目详情页，点击 **Custom domains**
2. 输入你的域名（如 `duiniang.example.com`）
3. 点击 **Continue**

### 2. 配置 DNS

根据提示在你的域名注册商处添加 CNAME 记录：

```
类型: CNAME
名称: duiniang（或你的子域名）
内容: duiniang.pages.dev
```

### 3. 等待生效

DNS 解析通常需要几分钟到几小时生效。

---

## 配置后端 API 地址

部署前需要修改前端代码中的 API 地址。

### 修改买家端 API 地址

编辑以下文件，将 `API_BASE_URL` 改为你的 Render 后端地址：

1. `frontend/buyer/app.js`
2. `frontend/buyer/detail.js`
3. `frontend/buyer/order.js`
4. `frontend/buyer/query.js`

```javascript
const API_BASE_URL = 'https://your-render-app.onrender.com';
```

### 修改卖家端 API 地址

编辑以下文件：

1. `frontend/seller/login.html`
2. `frontend/seller/products.js`
3. `frontend/seller/orders.js`

```javascript
const API_BASE_URL = 'https://your-render-app.onrender.com';
```

---

## 自动部署

配置完成后，每次推送到主分支，Cloudflare Pages 会自动部署更新。

---

## 预览部署

Cloudflare Pages 支持预览部署：
1. 创建新分支并推送
2. 在 Pull Request 中会自动生成预览链接
3. 可以在部署前预览效果

---

## 环境变量（可选）

如果需要使用环境变量：

1. 在 Pages 项目详情页，点击 **Settings**
2. 选择 **Environment variables**
3. 添加变量（目前静态站点支持有限）

---

## 访问统计

Cloudflare 提供基本的访问统计：
1. 在 Pages 项目详情页，点击 **Analytics**
2. 可以查看访问量、带宽使用等

---

## 生成买家访问二维码

部署完成后，可以使用在线工具生成二维码：

1. 访问 [QR Code Generator](https://www.qr-code-generator.com/)
2. 输入你的买家端地址：`https://duiniang.pages.dev/buyer/`
3. 下载二维码图片
4. 打印或分享给买家

---

## 常见问题

### 1. 页面显示 404

**问题**：访问子页面返回 404

**解决方案**：
- 检查文件路径是否正确
- 确保 `frontend` 目录结构完整

### 2. API 请求失败

**问题**：前端无法请求后端 API

**解决方案**：
- 检查 API 地址是否正确
- 确保后端 CORS 配置允许你的域名
- 检查后端是否正常运行

### 3. 样式或脚本未加载

**问题**：页面样式或功能异常

**解决方案**：
- 检查浏览器控制台是否有错误
- 确保文件路径正确
- 清除浏览器缓存后重试

---

## 本地预览

部署前可以本地预览：

```bash
# 进入前端目录
cd frontend

# 使用 Python 启动本地服务器
python -m http.server 8080

# 或使用 Node.js
npx serve .

# 访问 http://localhost:8080
```

---

## 目录结构说明

```
frontend/
├── buyer/              # 买家端页面
│   ├── index.html     # 商品列表页
│   ├── detail.html    # 商品详情页
│   ├── order.html     # 预定表单页
│   ├── query.html     # 订单查询页
│   ├── style.css      # 公共样式
│   ├── detail.css     # 详情页样式
│   ├── order.css      # 预定页样式
│   ├── query.css      # 查询页样式
│   ├── app.js         # 列表页脚本
│   ├── detail.js      # 详情页脚本
│   ├── order.js       # 预定页脚本
│   └── query.js       # 查询页脚本
└── seller/             # 卖家后台页面
    ├── login.html     # 登录页
    ├── products.html  # 商品管理页
    ├── orders.html    # 订单管理页
    ├── products.js    # 商品管理脚本
    └── orders.js      # 订单管理脚本
```