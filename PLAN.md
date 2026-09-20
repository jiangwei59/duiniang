# 对联预定售卖系统开发计划

## 项目概述
开发一个对联预定售卖系统，前后端分离，支持买家浏览预定和卖家后台管理。

## 技术栈
- 后端：Python FastAPI + MySQL
- 前端：原生 HTML/CSS/JS
- 部署：Render（后端）+ Cloudflare Pages（前端）

## 开发任务清单

### 阶段一：数据库设计
- [x] 创建 MySQL 建表 SQL（卖家表、商品表、订单表）

### 阶段二：后端开发
- [x] FastAPI 项目结构搭建
- [x] 数据库连接配置
- [x] 商品管理 API（CRUD）
- [x] 订单管理 API
- [x] 文件上传 API
- [x] 卖家登录认证

### 阶段三：前端开发
- [x] 买家端 - 商品列表页
- [x] 买家端 - 商品详情页
- [x] 买家端 - 预定表单页
- [x] 买家端 - 订单查询页
- [x] 卖家端 - 登录页
- [x] 卖家端 - 商品管理页
- [x] 卖家端 - 订单管理页

### 阶段四：部署文档
- [x] Render 部署指南
- [x] Cloudflare Pages 部署指南
- [x] 阿里云 RDS 配置说明
- [x] 本地联调测试说明

## 项目结构
```
duiniang/
├── backend/              # FastAPI 后端
│   ├── main.py          # 主入口
│   ├── config.py        # 配置文件
│   ├── database.py      # 数据库连接
│   ├── models/          # 数据模型
│   ├── routers/         # 路由
│   ├── schemas/         # Pydantic 模型
│   └── requirements.txt
├── frontend/            # 前端页面
│   ├── buyer/          # 买家端
│   └── seller/         # 卖家端
└── docs/               # 文档
```
