#!/bin/bash
# ============================================================
# SSL 证书配置脚本 - Let's Encrypt 免费证书
# 使用方法: sudo bash ssl-setup.sh your-domain.com
# ============================================================

set -e

DOMAIN="${1:-}"
EMAIL="${2:-admin@$DOMAIN}"

if [ -z "$DOMAIN" ]; then
    echo "Usage: sudo bash ssl-setup.sh your-domain.com [email]"
    echo "Example: sudo bash ssl-setup.sh anqing.example.com"
    exit 1
fi

echo "========================================"
echo "  SSL 证书配置"
echo "  域名: $DOMAIN"
echo "  邮箱: $EMAIL"
echo "========================================"
echo ""

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_DIR"

# ===== 1. 安装 Certbot =====
echo "[1/6] 安装 Certbot..."
if ! command -v certbot &> /dev/null; then
    if command -v apt &> /dev/null; then
        apt update && apt install -y certbot
    elif command -v yum &> /dev/null; then
        yum install -y certbot
    else
        echo "请手动安装 certbot"
        exit 1
    fi
fi

# ===== 2. 更新 Nginx 配置 =====
echo "[2/6] 更新 Nginx 配置..."
sed -i "s/your-domain.com/$DOMAIN/g" nginx-ssl.conf

# ===== 3. 临时启动 Nginx 获取证书 =====
echo "[3/6] 临时启动 Nginx..."
docker-compose -f docker-compose.prod.yml up -d nginx

# ===== 4. 申请证书 =====
echo "[4/6] 申请 Let's Encrypt 证书..."
mkdir -p certbot certbot-www
certbot certonly --webroot \
    -w "$APP_DIR/certbot-www" \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive \
    --force-renewal

# ===== 5. 重启 Nginx =====
echo "[5/6] 重启 Nginx..."
docker-compose -f docker-compose.prod.yml restart nginx

# ===== 6. 测试自动续期 =====
echo "[6/6] 测试证书续期..."
certbot renew --dry-run

echo ""
echo "========================================"
echo "  SSL 证书配置完成！"
echo "========================================"
echo ""
echo "  域名: https://$DOMAIN"
echo "  证书路径: ./certbot/live/$DOMAIN/"
echo "  自动续期: 已启用（每12小时检查一次）"
echo ""
echo "  手动续期命令:"
echo "    certbot renew"
echo ""
echo "========================================"
