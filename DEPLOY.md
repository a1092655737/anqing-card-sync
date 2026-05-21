# 安青卡业 - 云服务器部署指南

## 一、准备工作

### 1. 购买云服务器（推荐配置）
| 配置项 | 最低配置 | 推荐配置 |
|--------|---------|---------|
| CPU | 1核 | 2核 |
| 内存 | 2GB | 4GB |
| 带宽 | 1Mbps | 3Mbps+ |
| 系统盘 | 20GB | 40GB |
| 系统 | CentOS 7+/Ubuntu 20+/Debian 11+ |

**推荐平台**：阿里云、腾讯云、华为云（选择离你最近的地区）

### 2. 开放端口
在云平台安全组/防火墙中开放：
- `3000` - 应用端口（必须）
- `80` - HTTP（可选，使用Nginx时）
- `443` - HTTPS（可选，使用SSL时）
- `3306` - MySQL（可选，如需要外部访问数据库）

---

## 二、部署步骤

### 方式一：一键脚本部署（推荐）

```bash
# 1. 上传项目文件到服务器
# 使用 SCP 或 FTP 将项目文件上传到 /root/anqing-card/

# 2. 进入项目目录
cd /root/anqing-card

# 3. 运行部署脚本
chmod +x deploy.sh
sudo bash deploy.sh
```

脚本会自动完成：
- 安装 Docker 和 Docker Compose
- 构建应用镜像
- 初始化数据库
- 启动所有服务

### 方式二：手动部署

```bash
# 1. 安装 Docker
curl -fsSL https://get.docker.com | bash
systemctl enable docker
systemctl start docker

# 2. 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 3. 进入项目目录
cd /path/to/anqing-card

# 4. 构建并启动
docker-compose up -d --build

# 5. 推送数据库表结构
docker-compose run --rm app sh -c "npm run db:push"

# 6. 查看状态
docker-compose ps
```

---

## 三、访问应用

部署完成后，通过浏览器访问：

```
http://你的服务器IP:3000
```

如需使用域名，请：
1. 域名解析到服务器 IP
2. 修改 `nginx.conf` 中的 `server_name`
3. 重新加载配置：`docker-compose restart nginx`

---

## 四、日常维护

### 查看日志
```bash
cd /opt/anqing-card
docker-compose logs -f app      # 应用日志
docker-compose logs -f mysql    # 数据库日志
```

### 重启服务
```bash
cd /opt/anqing-card
docker-compose restart
```

### 更新部署
```bash
cd /opt/anqing-card
# 1. 上传新的代码文件
# 2. 重新构建
docker-compose down
docker-compose up -d --build
# 3. 推送数据库变更（如有schema修改）
docker-compose run --rm app sh -c "npm run db:push"
```

### 数据备份
```bash
# 备份数据库
docker exec anqing-mysql mysqldump -u anqing -pAnqing@2026 anqing_card > backup.sql

# 恢复数据库
docker exec -i anqing-mysql mysql -u anqing -pAnqing@2026 anqing_card < backup.sql
```

---

## 五、多人使用

部署到云服务器后，所有团队成员访问同一个网址即可实现数据共享：

| 功能 | 说明 |
|------|------|
| 标题甄选 | 所有人编辑的数据自动同步到数据库 |
| 岗位进程 | 所有人可见，实时更新 |
| 卡品信息 | 从数据库读取，统一管理 |
| 数据持久化 | MySQL 数据库存储，不会丢失 |

---

## 六、常见问题

### Q: 部署后页面打不开？
检查防火墙/安全组是否开放了 3000 端口。

### Q: 数据库连接失败？
检查 `docker-compose.yml` 中的数据库配置，确认 MySQL 容器已正常启动。

### Q: 如何修改数据库密码？
修改 `docker-compose.yml` 中 MySQL 的环境变量，然后重新部署。

### Q: 需要SSL/HTTPS？
可以使用 Nginx + Let's Encrypt 免费证书，或云平台的 SSL 证书服务。
