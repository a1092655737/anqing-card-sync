# Render 一键部署指南

## 方式一：自动部署（推荐，2分钟）

### 1. 获取 GitHub Token

1. 打开 https://github.com/settings/tokens/new
2. Token name 填 `render-deploy`
3. 勾选 **repo** 权限
4. 点击 **Generate token**
5. **复制 token**（以 `ghp_` 开头）

### 2. 运行自动部署脚本

```bash
cd /mnt/agents/output/app
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
bash deploy.sh
```

脚本会自动完成：
- 创建 GitHub 仓库
- 推送代码
- 输出 Render 配置

### 3. 在 Render 创建服务

1. 打开 https://dashboard.render.com
2. 点击 **New + → Web Service**
3. 选择你的 `anqing-card-sync` 仓库
4. 配置自动填入，只需添加 **Environment Variables**：

| 变量 | 值 |
|------|-----|
| `DATABASE_URL` | `mysql://2bxTomrbvBfMEC4.root:7m0aiTOJbefcRFZoA5kQd8INJEY2JHbs@ep-t4ni387b5e83b7519dc8.epsrv-t4n281l4mrmemi4zls9a.ap-southeast-1.privatelink.aliyuncs.com:4000/19e20a36-ff72-8f6e-8000-09cca51bd70e` |
| `APP_SECRET` | `FyrifOShYakNtpWL3y1CcyIH3xW9c6VY` |

5. 点击 **Create Web Service**

---

## 方式二：Blueprint 部署

如果已推送代码到 GitHub，可以直接使用 Blueprint：

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/你的用户名/anqing-card-sync)

部署后只需在 Render 设置中补全 `DATABASE_URL` 和 `APP_SECRET` 环境变量。

---

## 方式三：手动部署

1. 在 GitHub 创建仓库 `anqing-card-sync`
2. 推送代码
3. 在 Render 创建 Web Service，选择 GitHub 仓库
4. 填入配置和环境变量
