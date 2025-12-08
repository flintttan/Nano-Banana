#!/bin/bash

# Docker Compose 配置验证脚本
# 用于验证 docker-compose.yml 配置是否正确

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_file() {
    if [ -f "$1" ]; then
        print_success "✓ $1 存在"
        return 0
    else
        print_error "✗ $1 不存在"
        return 1
    fi
}

check_command() {
    if command -v "$1" &> /dev/null; then
        print_success "✓ $1 已安装"
        return 0
    else
        print_error "✗ $1 未安装"
        return 1
    fi
}

echo ""
echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}  Docker Compose 配置验证${NC}"
echo -e "${BLUE}===========================================${NC}"
echo ""

ERRORS=0

# 检查依赖
print_info "检查系统依赖..."
check_command "docker" || ((ERRORS++))
check_command "docker compose" || ((ERRORS++))

if command -v docker compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION=$(docker compose version --short 2>/dev/null || echo "未知")
    print_info "Docker Compose 版本: $DOCKER_COMPOSE_VERSION"
fi

echo ""

# 检查文件
print_info "检查配置文件..."
check_file "docker-compose.yml" || ((ERRORS++))
check_file ".env.example" || ((ERRORS++))

if [ -f ".env" ]; then
    print_success "✓ .env 文件存在"
else
    print_warning "⚠ .env 文件不存在（将使用默认值）"
fi

check_file "Dockerfile" || ((ERRORS++))
check_file ".dockerignore" || ((ERRORS++))

echo ""

# 验证 docker-compose.yml 语法
if [ -f "docker-compose.yml" ]; then
    print_info "验证 docker-compose.yml 语法..."
    if docker compose config -q; then
        print_success "✓ docker-compose.yml 语法正确"
    else
        print_error "✗ docker-compose.yml 语法错误"
        ((ERRORS++))
    fi
fi

echo ""

# 检查端口占用
print_info "检查端口占用..."
PORTS=(3000 3306 6379)
for port in "${PORTS[@]}"; do
    if command -v netstat &> /dev/null; then
        if netstat -ln 2>/dev/null | grep -q ":$port "; then
            print_warning "⚠ 端口 $port 已被占用"
        else
            print_success "✓ 端口 $port 可用"
        fi
    else
        print_warning "⚠ 无法检查端口 $port（netstat 未安装）"
    fi
done

echo ""

# 检查磁盘空间
print_info "检查磁盘空间..."
if command -v df &> /dev/null; then
    AVAILABLE=$(df -h . | awk 'NR==2 {print $4}')
    print_info "当前目录可用空间: $AVAILABLE"
    print_success "✓ 磁盘空间充足"
else
    print_warning "⚠ 无法检查磁盘空间"
fi

echo ""

# 检查环境变量配置
print_info "检查环境变量配置..."
if [ -f ".env" ]; then
    REQUIRED_VARS=(
        "JWT_SECRET"
        "AI_API_KEY"
        "MYSQL_ROOT_PASSWORD"
    )

    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^$var=" .env && ! grep -q "^$var=$" .env; then
            print_success "✓ $var 已配置"
        else
            print_error "✗ $var 未配置或为空"
            ((ERRORS++))
        fi
    done
else
    print_warning "⚠ .env 文件不存在，无法验证环境变量"
fi

echo ""

# 生成报告
echo -e "${BLUE}===========================================${NC}"
if [ $ERRORS -eq 0 ]; then
    print_success "验证通过！所有检查项均正常"
    echo ""
    print_info "下一步操作："
    echo "  1. 编辑 .env 文件，配置必需的环境变量"
    echo "  2. 运行: docker compose up -d"
    echo "  3. 访问: http://localhost:3000"
    echo ""
    exit 0
else
    print_error "验证失败！发现 $ERRORS 个错误"
    echo ""
    print_info "请修复上述错误后重新运行验证"
    echo ""
    exit 1
fi
