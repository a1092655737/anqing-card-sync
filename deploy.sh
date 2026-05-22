#!/bin/bash
# 安青卡业 - Render 一键部署脚本
# 用法: bash deploy.sh

set -e

echo ""
echo "========================================"
echo "  安青卡业 - Render 云端部署"
echo "========================================"
echo ""

# 安装 gh CLI (如未安装)
if ! command -v gh &> /dev/null; then
    echo "[1/4] 安装 GitHub CLI..."
    npm install -g gh 2>/dev/null || true
fi

if ! command -v gh &> /dev/null; then
    echo "GitHub CLI 安装失败，请手动安装: https://cli.github.com"
    exit 1
fi

# GitHub 登录
if ! gh auth status &> /dev/null; then
    echo ""
    echo "[1/4] 登录 GitHub..."
    echo "请在浏览器中完成授权..."
    gh auth login --web --scopes repo
fi

GITHUB_USER=$(gh api user -q .login 2>/dev/null || echo "")
if [ -z "$GITHUB_USER" ]; then
    echo "无法获取 GitHub 用户名，请检查登录状态"
    exit 1
fi

echo "GitHub 用户: $GITHUB_USER"

# 创建仓库
REPO_NAME="anqing-card-sync"
echo ""
echo "[2/4] 创建 GitHub 仓库..."

if gh repo view "$GITHUB_USER/$REPO_NAME" &> /dev/null; then
    echo "仓库 $REPO_NAME 已存在，直接推送..."
else
    echo "创建新仓库 $REPO_NAME..."
    gh repo create "$REPO_NAME" --public --source=. --push
    echo "仓库创建并推送完成！"
fi

# 确保远程仓库正确并推送
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
git branch -M main 2>/dev/null || true

echo "推送代码..."
git push -u origin main --force

echo ""
echo "========================================"
echo "  GitHub 推送完成！"
echo "  https://github.com/$GITHUB_USER/$REPO_NAME"
echo "========================================"

# Render 部署
echo ""
echo "[3/4] 准备 Render 部署..."
echo ""

# 检查 Render CLI
if command -v render &> /dev/null; then
    echo "Render CLI 已安装，尝试自动创建服务..."
    # 使用 Render blueprint 部署
    if [ -f "render.yaml" ]; then
        echo "发现 render.yaml，使用 Blueprint 部署..."
        render blueprint launch --repo "$GITHUB_USER/$REPO_NAME" 2>/dev/null || echo "自动部署失败，请手动创建"
    fi
else
    echo "Render CLI 未安装，请手动创建服务..."
fi

echo ""
echo "========================================"
echo "  部署步骤"
echo "========================================"
echo ""
echo "请在浏览器中完成以下操作："
echo ""
echo "  1. 打开 https://dashboard.render.com"
echo "  2. 点击 [New +] → [Web Service]"
echo "  3. 连接 GitHub 仓库: $GITHUB_USER/$REPO_NAME"
echo "  4. 按以下配置填写："
echo ""
echo "     ┌─────────────────────────────────────────────┐"
echo "     │  Name:           anqing-card-sync           │"
echo "     │  Region:         Singapore                  │"
echo "     │  Branch:         main                       │"
echo "     │  Runtime:        Node                       │"
echo "     │  Build Command:  npm install && npm run build│"
echo "     │  Start Command:  npm start                  │"
echo "     │  Plan:           Free                       │"
echo "     └─────────────────────────────────────────────┘"
echo ""
echo "  5. 点击 [Advanced] → [Environment Variables]"
echo "     添加以下环境变量："
echo ""
cat << 'EOF'
     ┌────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
     │ 变量名              │ 值                                                                                                       │
     ├────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
     │ NODE_ENV           │ production                                                                                               │
     │ DATABASE_URL       │ mysql://2bxTomrbvBfMEC4.root:7m0aiTOJbefcRFZoA5kQd8INJEY2JHbs@ep-t4ni387b5e83b7519dc8.epsrv-...       │
     │ APP_ID             │ 19e20a70-b892-8b29-8000-0000e4162c09                                                                    │
     │ APP_SECRET         │ FyrifOShYakNtpWL3y1CcyIH3xW9c6VY                                                                       │
     │ KIMI_AUTH_URL      │ https://auth.kimi.com                                                                                    │
     │ KIMI_OPEN_URL      │ https://open.kimi.com                                                                                    │
     │ VITE_APP_ID        │ 19e20a70-b892-8b29-8000-0000e4162c09                                                                    │
     │ VITE_KIMI_AUTH_URL │ https://auth.kimi.com                                                                                    │
     └────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────┘

EOF

echo "  6. 点击 [Create Web Service]"
echo ""
echo "  Render 会自动构建并部署！"
echo "  部署完成后会分配一个域名，例如:"
echo "  https://anqing-card-sync.onrender.com"
echo ""
echo "========================================"
echo "  完成后数据自动云端同步！"
echo "========================================"
echo ""
