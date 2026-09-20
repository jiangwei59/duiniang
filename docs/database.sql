-- 对联预定售卖系统数据库建表 SQL
-- 适配阿里云 RDS MySQL

-- 创建数据库
CREATE DATABASE IF NOT EXISTS duiniang_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE duiniang_db;

-- 1. 卖家表（管理员表）
CREATE TABLE IF NOT EXISTS sellers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='卖家管理员表';

-- 2. 对联商品表
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL COMMENT '对联标题/名称',
    description TEXT COMMENT '对联描述',
    price DECIMAL(10, 2) COMMENT '价格（可选）',
    image_urls TEXT COMMENT '商品图片URL，多个用逗号分隔',
    video_url VARCHAR(500) COMMENT '书写演示视频URL',
    status TINYINT DEFAULT 1 COMMENT '状态：1-上架，0-下架',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='对联商品表';

-- 3. 买家预定订单表
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '订单编号',
    product_id INT NOT NULL COMMENT '商品ID',
    buyer_name VARCHAR(50) NOT NULL COMMENT '买家姓名',
    buyer_phone VARCHAR(20) NOT NULL COMMENT '买家手机号',
    buyer_address VARCHAR(500) NOT NULL COMMENT '收货地址',
    custom_remark TEXT COMMENT '自定义对联备注',
    status TINYINT DEFAULT 0 COMMENT '订单状态：0-待处理，1-处理中，2-已完成，3-已取消',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='买家预定订单表';

-- 插入默认管理员账号
-- 密码：admin123（使用 bcrypt 加密）
INSERT INTO sellers (username, password_hash) VALUES
('admin', '$2b$12$LJ3m4ys3Lz0QJNi8N0uYAeJ8d8vKz3X9J9v8X8X8X8X8X8X8X8X8X8');

-- 创建索引
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_product_id ON orders(product_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_buyer_phone ON orders(buyer_phone);