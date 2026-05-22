#!/bin/bash
# 安青卡业 - Render 一键部署脚本
# 用法: bash deploy.sh [GITHUB_USERNAME] [GITHUB_TOKEN]

set -e

echo ""
echo "========================================"
echo "  安青卡业 - Render 云端部署"
echo "========================================"
echo ""

# 参数或环境变量
GITHUB_USER="${1:-${GITHUB_USER:-}}"
GITHUB_TOKEN="${2:-${GITHUB_TOKEN:-${GH_TOKEN:-}}}"
REPO_NAME="anqing-card-sync"

# 安装 gh CLI
GH_BIN="$(npm root -g 2>/dev/null)/gh/bin/gh.js"
if [ -f "$GH_BIN" ]; then
    GH_CMD="node $GH_BIN"
else
    echo "安装 GitHub CLI..."
    npm install -g gh 2>/dev/null || true
    GH_BIN="$(npm root -g 2>/dev/null)/gh/bin/gh.js"
    if [ -f "$GH_BIN" ]; then
        GH_CMD="node $GH_BIN"
    else
        echo "❌ GitHub CLI 安装失败"
        exit 1
    fi
fi

# GitHub 认证
if ! $GH_CMD auth status &> /dev/null; then
    if [ -n "$GITHUB_TOKEN" ]; then
        echo "🔑 使用 GITHUB_TOKEN 认证..."
        echo "$GITHUB_TOKEN" | $GH_CMD auth login --with-token
    else
        echo ""
        echo "⚠️  需要 GitHub 认证"
        echo ""
        echo "请选择以下方式之一："
        echo ""
        echo "  方式1 - 环境变量（推荐）:"
        echo "    export GITHUB_TOKEN=你的个人访问令牌"
        echo "    bash deploy.sh"
        echo ""
        echo "  方式2 - 命令行参数:"
        echo "    bash deploy.sh 你的用户名 你的个人访问令牌"
        echo ""
        echo "  方式3 - 交互式登录:"
        echo "    $GH_CMD auth login"
        echo "    # 完成后重新运行 bash deploy.sh"
        echo ""
        echo "获取 GitHub Token: https://github.com/settings/tokens/new"
        echo "需要勾选 'repo' 权限"
        echo ""
        exit 1
    fi
fi

# 获取 GitHub 用户名
if [ -z "$GITHUB_USER" ]; then
    GITHUB_USER=$($GH_CMD api user -q .login 2>/dev/null || echo "")
fi

if [ -z "$GITHUB_USER" ]; then
    echo "❌ 无法获取 GitHub 用户名"
    exit 1
fi

echo "✅ GitHub 用户: $GITHUB_USER"

# 创建仓库
echo ""
echo "[1/4] 创建 GitHub 仓库..."

if $GH_CMD repo view "$GITHUB_USER/$REPO_NAME" &> /dev/null; then
    echo "   仓库已存在: https://github.com/$GITHUB_USER/$REPO_NAME"
else
    echo "   创建新仓库..."
    $GH_CMD repo create "$REPO_NAME" --public
    echo "   ✅ 仓库创建成功"
fi

# 推送代码
echo ""
echo "[2/4] 推送代码..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://$GITHUB_USER:$GITHUB_TOKEN@github.com/$GITHUB_USER/$REPO_NAME.git" 2>/dev/null || \
    git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
git branch -M main 2>/dev/null || true
git push -u origin main --force
echo "   ✅ 代码推送完成"

# 输出 Render 部署信息
echo ""
echo "========================================"
echo "  [3/4] Render 部署配置"
echo "========================================"
echo ""
echo "请在浏览器中完成以下操作："
echo ""
echo "  1. 打开 👉 https://dashboard.render.com"
echo "  2. 点击 [New +] → [Web Service]"
echo "  3. 选择 GitHub 仓库: $GITHUB_USER/$REPO_NAME"
echo "  4. 填写配置："
echo ""
echo "     ┌──────────────────────────────────────────────────┐"
echo "     │  Name:           anqing-card-sync                │"
echo "     │  Region:         Singapore                       │"
echo "     │  Branch:         main                            │"
echo "     │  Runtime:        Node                            │"
echo "     │  Build:          npm install && npm run build    │"
echo "     │  Start:          npm start                       │"
echo "     │  Plan:           Free                            │"
echo "     └──────────────────────────────────────────────────┘"
echo ""
echo "  5. 点击 [Advanced] → 添加环境变量："
echo ""

# 读取 .env 文件并显示
if [ -f ".env" ]; then
    while IFS= read -r line; do
        # 跳过注释和空行
        case "$line" in
            \#*|""|*DATABASE_URL*) continue ;;
        esac
        key=$(echo "$line" | cut -d= -f1)
        val=$(echo "$line" | cut -d= -f2-)
        echo "     $key=$val"
    done < .env
    echo ""
    echo "     DATABASE_URL=mysql://...(详见.env文件)"
fi

echo ""
echo "  6. 点击 [Create Web Service]"
echo ""
echo "  Render 会自动构建并部署！"
echo "  部署完成后会分配域名，例如:"
echo "  https://anqing-card-sync.onrender.com"
echo ""
echo "========================================"
echo "  [4/4] 部署完成 🎉"
echo "========================================"
echo ""
echo "云端同步功能已启用！"
echo "在任何设备访问部署后的网站，数据会自动同步。"
echo ""
