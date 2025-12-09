#!/bin/bash

# ==========================================
# Nano Banana Docker 启动脚本
# ==========================================

echo "=========================================="
echo "  🚀 Nano Banana Docker 启动脚本"
echo "=========================================="
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 检查 .env 文件是否存在
if [ ! -f .env ]; then
    echo "⚠️  .env 文件不存在，正在从 .env.example 复制..."
    cp .env.example .env
    echo "✅ 已复制 .env.example 到 .env"
    echo "⚠️  请修改 .env 文件中的配置，特别是："
    echo "   - JWT_SECRET (JWT 密钥)"
    echo "   - AI_API_KEY (AI API 密钥)"
    echo "   - AI_API_BASE_URL (AI API 基础地址)"
    echo ""
    read -p "按 Enter 键继续，或修改 .env 后再次运行此脚本..."
fi

# 创建必要的目录
echo "📁 创建必要的数据目录..."
mkdir -p data/mysql
mkdir -p data/redis
mkdir -p data/uploads
mkdir -p data/logs
mkdir -p nginx/ssl
echo "✅ 目录创建完成"
echo ""

# 停止并清理旧容器
echo "🧹 清理旧容器（如果存在）..."
docker-compose down -v 2>/dev/null || true
echo ""

# 构建并启动服务
echo "🔨 构建 Docker 镜像..."
docker-compose build

echo ""
echo "🚀 启动所有服务..."
docker-compose up -d

echo ""
echo "=========================================="
echo "✅ 服务启动完成！"
echo "=========================================="
echo ""
echo "📊 服务状态："
docker-compose ps
echo ""
echo "🌐 访问地址："
echo "   前端页面: http://localhost:${APP_PORT:-3000}"
echo "   API 接口: http://localhost:${APP_PORT:-3000}/api"
echo ""
echo "📝 查看日志："
echo "   docker-compose logs -f app"
echo ""
echo "🛑 停止服务："
echo "   docker-compose down"
echo ""
echo "🗄️ 停止并删除数据："
echo "   docker-compose down -v"
echo ""
