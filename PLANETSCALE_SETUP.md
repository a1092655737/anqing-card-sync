# PlanetScale 数据库设置指南

## 第 1 步：注册 PlanetScale

1. 打开 https://planetscale.com
2. 点击 "Sign Up"，选择 "Sign up with GitHub"
3. 授权登录

## 第 2 步：创建数据库

1. 点击 "Create database"
2. Database name 填：`anqing-sync`
3. Region 选：`Singapore (ap-southeast-1)`
4. 点击 "Create database"

## 第 3 步：创建表

1. 进入数据库后，点击 "Console" 标签
2. 在 SQL 编辑器中粘贴以下 SQL：

```sql
CREATE TABLE title_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(2000) NOT NULL,
  direction VARCHAR(2000) NOT NULL DEFAULT '',
  reference VARCHAR(2000) NOT NULL DEFAULT '',
  reference_images JSON DEFAULT NULL,
  director_suggest VARCHAR(2000) NOT NULL DEFAULT '',
  director_vote ENUM('agree','pending') DEFAULT 'pending',
  editor_suggest VARCHAR(2000) NOT NULL DEFAULT '',
  editor_vote ENUM('agree','pending') DEFAULT 'pending',
  operator_suggest VARCHAR(2000) NOT NULL DEFAULT '',
  operator_vote ENUM('agree','pending') DEFAULT 'pending',
  final_decision ENUM('execute','reject') DEFAULT 'execute',
  row_highlight ENUM('none','green','red') DEFAULT 'none',
  created_at VARCHAR(20) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE position_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_product VARCHAR(2000) NOT NULL DEFAULT '',
  topic_name VARCHAR(2000) NOT NULL DEFAULT '',
  publish_account VARCHAR(2000) NOT NULL DEFAULT '',
  copywriter VARCHAR(2000) NOT NULL DEFAULT '',
  copy_start_time VARCHAR(20) NOT NULL DEFAULT '',
  copy_end_time VARCHAR(20) NOT NULL DEFAULT '',
  video_producer VARCHAR(2000) NOT NULL DEFAULT '',
  video_start_time VARCHAR(20) NOT NULL DEFAULT '',
  video_end_time VARCHAR(20) NOT NULL DEFAULT '',
  publish_time VARCHAR(30) NOT NULL DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

3. 点击 "Run" 执行

## 第 4 步：获取连接字符串

1. 点击左侧 "Connect"
2. 选择 "@planetscale/database"（这是PlanetScale的JS驱动）
3. 点击 "Create password"
4. 复制连接信息：
   - Host
   - Username
   - Password
   - Database name

## 第 5 步：更新 Render 环境变量

1. 打开 Render Dashboard
2. 点击你的服务
3. 点击 "Environment" 标签
4. 修改 DATABASE_URL：
   
   格式：`mysql://用户名:密码@主机地址:3306/数据库名?ssl={"rejectUnauthorized":true}`

5. 点击 "Save Changes"
6. 点击 "Manual Deploy" → "Deploy latest commit"
