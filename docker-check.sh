#!/bin/bash

# ==========================================
# Docker 环境检查脚本
# ==========================================

echo "=========================================="
echo "  🔍 Docker 环境检查"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查函数
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅ $1 已安装${NC}"
        $1 --version | head -n 1
        return 0
    else
        echo -e "${RED}❌ $1 未安装${NC}"
        return 1
    fi
}

# 检查 Docker
echo "1. 检查 Docker..."
if check_command docker; then
    echo ""
else
    echo -e "${YELLOW}请安装 Docker: https://docs.docker.com/get-docker/${NC}"
    echo ""
fi

# 检查 Docker Compose
echo "2. 检查 Docker Compose..."
if check_command docker-compose; then
    echo ""
else
    echo -e "${YELLOW}请安装 Docker Compose: https://docs.docker.com/compose/install/${NC}"
    echo ""
fi

# 检查 Docker 服务状态
echo "3. 检查 Docker 服务状态..."
if docker info &> /dev/null; then
    echo -e "${GREEN}✅ Docker 服务运行正常${NC}"
    echo ""
else
    echo -e "${RED}❌ Docker 服务未运行${NC}"
    echo -e "${YELLOW}请启动 Docker 服务${NC}"
    echo ""
fi

# 检查 .env 文件
echo "4. 检查环境配置文件..."
if [ -f .env ]; then
    echo -e "${GREEN}✅ .env 文件存在${NC}"

    # 检查关键配置
    if grep -q "JWT_SECRET=your_jwt_secret" .env; then
        echo -e "${YELLOW}⚠️  JWT_SECRET 使用默认值，建议修改${NC}"
    fi

    if grep -q "AI_API_KEY=sk-xxx" .env || grep -q "AI_API_KEY=$" .env; then
        echo -e "${YELLOW}⚠️  AI_API_KEY 未配置，绘图功能将无法使用${NC}"
    fi
    echo ""
else
    echo -e "${YELLOW}⚠️  .env 文件不存在${NC}"
    echo -e "${YELLOW}   运行: cp .env.example .env${NC}"
    echo ""
fi

# 检查端口占用
echo "5. 检查端口占用..."
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ":$1 "; then
        echo -e "${YELLOW}⚠️  端口 $1 已被占用${NC}"
        return 1
    else
        echo -e "${GREEN}✅ 端口 $1 可用${NC}"
        return 0
    fi
}

check_port 3000
check_port 3306
check_port 6379
echo ""

# 检查磁盘空间
echo "6. 检查磁盘空间..."
available_space=$(df -h . | awk 'NR==2 {print $4}')
echo -e "${GREEN}✅ 可用空间: $available_space${NC}"
echo ""

# 检查现有容器
echo "7. 检查现有容器..."
if docker ps -a --filter "name=nano-banana" --format "{{.Names}}" | grep -q nano-banana; then
    echo -e "${YELLOW}⚠️  发现已存在的容器:${NC}"
    docker ps -a --filter "name=nano-banana" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo -e "${YELLOW}如需重新部署，请先运行: docker-compose down${NC}"
else
    echo -e "${GREEN}✅ 无现有容器${NC}"
fi
echo ""

# 总结
echo "=========================================="
echo "  📊 检查完成"
echo "=========================================="
echo ""
echo "如果所有检查都通过，可以运行："
echo -e "${GREEN}  ./docker-start.sh${NC}"
echo ""
