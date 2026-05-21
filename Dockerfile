# 安青卡业全栈应用 - Docker 容器
# 包含前端构建 + Node.js 后端 + MySQL 数据库

# ====== 构建阶段 ======
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
RUN npm install

# 复制源代码
COPY . .

# 构建前端
RUN npm run build

# ====== 生产阶段 ======
FROM node:20-alpine AS runner

WORKDIR /app

# 安装生产依赖
COPY package*.json ./
RUN npm install --production

# 复制构建产物和必要文件
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/api ./api
COPY --from=builder /app/contracts ./contracts
COPY --from=builder /app/db ./db
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/tsconfig.server.json ./
COPY --from=builder /app/.env ./

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "dist/server.js"]
