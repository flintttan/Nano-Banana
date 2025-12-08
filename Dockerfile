# 使用官方 Node.js 运行时作为父镜像
FROM node:16-alpine

# 设置维护者信息
LABEL maintainer="Nano Banana <admin@nanobanana.ai>"
LABEL description="Nano Banana AI Drawing Website"

# 设置工作目录
WORKDIR /app

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nano -u 1001

# 安装系统依赖
RUN apk add --no-cache \
    curl \
    mysql-client \
    && rm -rf /var/cache/apk/*

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装依赖
# 先安装 production 依赖，然后删除 dev 依赖
RUN npm install --production --no-optional && \
    npm cache clean --force

# 复制应用源代码
COPY . .

# 创建必要的目录
RUN mkdir -p /app/uploads /app/logs && \
    chown -R nano:nodejs /app

# 切换到非 root 用户
USER nano

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# 启动应用
CMD ["node", "server.js"]
