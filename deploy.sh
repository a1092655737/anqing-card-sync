#!/bin/bash
# ============================================================
# 安青卡业 - 一键部署脚本
# 支持：CentOS / Ubuntu / Debian
# ============================================================

set -e

APP_NAME="anqing-card"
APP_DIR="/opt/$APP_NAME"

echo "========================================"
echo "  安青卡业 - 云服务器部署脚本"
echo "========================================"
echo ""

# ===== 1. 检查 root 权限 =====
if [ "$EUID" -ne 0 ]; then
    echo "请使用 root 权限运行: sudo bash deploy.sh"
    exit 1
fi

# ===== 2. 安装 Docker =====
echo "[1/7] 检查 Docker..."
if ! command -v docker &> /dev/null; then
    echo "  正在安装 Docker..."
    curl -fsSL https://get.docker.com | bash
    systemctl enable docker
    systemctl start docker
    echo "  Docker 安装完成"
else
    echo "  Docker 已安装"
fi

# ===== 3. 安装 Docker Compose =====
echo "[2/7] 检查 Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    echo "  正在安装 Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "  Docker Compose 安装完成"
else
    echo "  Docker Compose 已安装"
fi

# ===== 4. 创建应用目录 =====
echo "[3/7] 创建应用目录..."
mkdir -p $APP_DIR

# ===== 5. 复制项目文件 =====
echo "[4/7] 复制项目文件..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cp -r "$SCRIPT_DIR"/* $APP_DIR/
cd $APP_DIR

# ===== 6. 构建并启动 =====
echo "[5/7] 构建 Docker 镜像（可能需要几分钟）..."
docker-compose build

echo "[6/7] 推送数据库表结构..."
docker-compose run --rm app sh -c "npm run db:push"

echo "[7/7] 启动服务..."
docker-compose up -d

# ===== 7. 完成 =====
echo ""
echo "========================================"
echo "  部署完成！"
echo "========================================"
echo ""
echo "  访问地址: http://$(curl -s ifconfig.me || echo '你的服务器IP'):3000"
echo "  管理命令:"
echo "    cd $APP_DIR"
echo "    docker-compose logs -f    # 查看日志"
echo "    docker-compose ps         # 查看状态"
echo "    docker-compose restart    # 重启服务"
echo "    docker-compose down       # 停止服务"
echo ""
echo "  MySQL 数据库信息:"
echo "    端口: 3306"
echo "    数据库: anqing_card"
echo "    用户名: anqing"
echo "    密码: Anqing@2026"
echo ""
echo "========================================"
