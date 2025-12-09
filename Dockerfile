FROM node:18-bullseye-slim

LABEL maintainer="Nano Banana <admin@nanobanana.ai>"
LABEL description="Nano Banana AI Drawing Website"

WORKDIR /app

# 安装系统依赖
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
    && rm -rf /var/lib/apt/lists/*

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 在容器内为当前平台安装依赖（包含 sharp 对应平台的预编译二进制）
RUN npm install --omit=dev && \
    npm cache clean --force

# 复制应用源代码
COPY . .

# 创建必要的目录并设置权限，使用基础镜像内置的 node 用户
RUN mkdir -p /app/uploads /app/logs && \
    chown -R node:node /app

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
