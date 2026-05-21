# 安青卡业 - 生产环境部署指南

## 一、准备工作

### 1. 购买云服务器（推荐配置）

| 配置项 | 最低配置 | 推荐配置 |
|--------|---------|---------|
| CPU | 1核 | 2核+ |
| 内存 | 2GB | 4GB+ |
| 带宽 | 3Mbps | 5Mbps+ |
| 系统盘 | 40GB SSD | 60GB SSD |
| 系统 | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |

**推荐平台**：阿里云、腾讯云、华为云

### 2. 购买域名

在域名服务商（阿里云/腾讯云/GoDaddy等）购买域名：
- 例如：`anqing.example.com`
- 添加 A 记录解析到服务器 IP

### 3. 安全组配置

开放以下端口：
- `22` - SSH（必须）
- `80` - HTTP（必须，用于SSL验证）
- `443` - HTTPS（必须）
- `3000` - 应用端口（可选，测试用）

---

## 二、快速部署（推荐）

### 第一步：上传项目到服务器

```bash
# 本地电脑上执行，将项目上传到服务器
scp -r ./anqing-card root@你的服务器IP:/root/

# 或使用 FTP 工具上传
```

### 第二步：SSH 登录服务器

```bash
ssh root@你的服务器IP
```

### 第三步：运行部署

```bash
cd /root/anqing-card

# 1. 基础部署
chmod +x deploy.sh
sudo bash deploy.sh

# 2. 配置域名和 SSL（替换为你的域名）
chmod +x ssl-setup.sh
sudo bash ssl-setup.sh anqing.example.com

# 3. 完成！访问 https://anqing.example.com
```

---

## 三、手动分步部署

如果你需要更精细的控制，可以按以下步骤手动部署。

### 1. 安装 Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | bash
systemctl enable docker
systemctl start docker

# 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### 2. 上传项目文件

```bash
# 创建目录
mkdir -p /opt/anqing-card
cd /opt/anqing-card

# 上传项目文件（通过SCP/FTP）
# ...
```

### 3. 配置域名

编辑 `nginx-ssl.conf`，将 `your-domain.com` 替换为你的域名：

```nginx
server_name anqing.example.com;
```

### 4. 启动基础服务

```bash
# 启动 MySQL 和应用
docker-compose -f docker-compose.prod.yml up -d mysql app

# 等待 MySQL 启动完成（约30秒）
sleep 30

# 推送数据库表结构
docker-compose -f docker-compose.prod.yml run --rm app sh -c "npm run db:push"
```

### 5. 配置 SSL 证书

```bash
# 安装 Certbot
apt update && apt install -y certbot

# 临时启动 Nginx
docker-compose -f docker-compose.prod.yml up -d nginx

# 申请证书
certbot certonly --webroot -w ./certbot-www -d anqing.example.com --email admin@example.com --agree-tos --non-interactive

# 重启 Nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### 6. 启动所有服务

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 7. 验证部署

```bash
# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 测试访问
curl http://localhost:3000/api/trpc/ping
```

---

## 四、域名配置详解

### DNS 解析设置

在域名服务商管理后台添加以下记录：

| 记录类型 | 主机记录 | 记录值 | TTL |
|---------|---------|--------|-----|
| A | @ | 你的服务器IP | 600 |
| A | www | 你的服务器IP | 600 |

**示例**：
- 如果你的域名是 `anqing.com`
- 服务器 IP 是 `123.45.67.89`
- 则 A 记录：主机 `@`，值 `123.45.67.89`

### 生效时间
- DNS 解析通常 5-30 分钟生效
- 最长可能需要 48 小时

---

## 五、SSL 证书详解

### 证书信息
- **类型**：Let's Encrypt 免费 DV 证书
- **有效期**：90 天
- **自动续期**：已配置，每12小时检查一次
- **费用**：完全免费

### 验证 SSL 配置

```bash
# 检查证书信息
echo | openssl s_client -servername anqing.example.com -connect anqing.example.com:443 2>/dev/null | openssl x509 -noout -text

# 测试 HTTPS 访问
curl -v https://anqing.example.com/api/trpc/ping
```

### 常见问题

**Q: 证书申请失败？**
- 检查域名 DNS 是否已解析到服务器
- 检查 80 端口是否开放
- 检查 nginx 是否正常运行

**Q: 证书即将过期？**
- 正常情况下会自动续期
- 手动续期：`certbot renew`

---

## 六、自动备份详解

### 备份策略
- **频率**：每天自动执行
- **保留期**：30天（自动删除过期备份）
- **存储位置**：`/opt/anqing-card/backups/`

### 手动备份

```bash
cd /opt/anqing-card

# 立即执行备份
docker exec anqing-mysql mysqldump -u anqing -pAnqing@2026 anqing_card > backups/manual_$(date +%Y%m%d_%H%M%S).sql
```

### 恢复备份

```bash
# 1. 进入备份目录
cd /opt/anqing-card/backups

# 2. 查看最新备份
ls -lt *.sql.gz | head -5

# 3. 解压并恢复
gunzip -c anqing_card_20260115_120000.sql.gz | docker exec -i anqing-mysql mysql -u anqing -pAnqing@2026 anqing_card
```

### 下载备份到本地

```bash
# 从服务器下载备份文件到本地电脑
scp root@你的服务器IP:/opt/anqing-card/backups/anqing_card_20260115_120000.sql.gz ./
```

---

## 七、日常维护

### 查看服务状态
```bash
cd /opt/anqing-card
docker-compose -f docker-compose.prod.yml ps
```

### 查看日志
```bash
# 应用日志
docker-compose -f docker-compose.prod.yml logs -f app

# Nginx 日志
docker-compose -f docker-compose.prod.yml logs -f nginx

# MySQL 日志
docker-compose -f docker-compose.prod.yml logs -f mysql

# 查看最近100行
docker-compose -f docker-compose.prod.yml logs --tail=100 app
```

### 重启服务
```bash
# 重启所有服务
docker-compose -f docker-compose.prod.yml restart

# 重启单个服务
docker-compose -f docker-compose.prod.yml restart app
```

### 更新部署
```bash
cd /opt/anqing-card

# 1. 拉取最新代码（或上传新代码）
# git pull 或 scp 上传

# 2. 重新构建
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# 3. 推送数据库变更（如有表结构更新）
docker-compose -f docker-compose.prod.yml run --rm app sh -c "npm run db:push"
```

### 停止服务
```bash
cd /opt/anqing-card
docker-compose -f docker-compose.prod.yml down
```

---

## 八、安全建议

### 1. 修改默认密码
编辑 `docker-compose.prod.yml`：
```yaml
environment:
  MYSQL_ROOT_PASSWORD: 你的强密码
  MYSQL_PASSWORD: 你的强密码
```

然后重启：
```bash
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### 2. 配置防火墙（可选）
```bash
# Ubuntu/Debian
ufw default deny incoming
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

### 3. 定期更新系统
```bash
apt update && apt upgrade -y
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

---

## 九、故障排除

### 问题1: 页面打不开
```bash
# 检查服务状态
docker-compose -f docker-compose.prod.yml ps

# 检查 Nginx 日志
docker-compose -f docker-compose.prod.yml logs nginx

# 检查应用日志
docker-compose -f docker-compose.prod.yml logs app
```

### 问题2: 数据库连接失败
```bash
# 检查 MySQL 是否运行
docker-compose -f docker-compose.prod.yml ps mysql

# 测试数据库连接
docker exec -it anqing-mysql mysql -u anqing -pAnqing@2026 -e "SHOW DATABASES;"
```

### 问题3: SSL 证书过期
```bash
# 手动续期
certbot renew

# 重启 Nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### 问题4: 备份失败
```bash
# 检查备份目录权限
ls -la /opt/anqing-card/backups/

# 手动测试备份
docker exec anqing-mysql mysqldump -u anqing -pAnqing@2026 anqing_card > /tmp/test.sql
```

---

## 十、多人使用说明

部署完成后，所有团队成员访问同一域名即可：

```
https://anqing.example.com
```

### 数据共享
- 标题甄选：所有人编辑自动同步到数据库
- 岗位进程：所有人可见，实时更新
- 卡品信息：从数据库读取，统一管理

### 权限说明（当前版本）
- 所有用户均可编辑所有数据
- 数据自动保存，无冲突处理
- 如需用户权限管理，可后续扩展

---

## 联系方式

如有部署问题，请提供以下信息：
1. 服务器系统版本
2. Docker 版本
3. 错误日志
4. 域名和IP（可脱敏）
