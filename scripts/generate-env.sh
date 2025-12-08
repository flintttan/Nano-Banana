#!/bin/bash

# ============================================
# Nano Banana 环境变量生成器
# 快速生成安全的 .env 文件
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

print_title() {
    echo ""
    echo -e "${BLUE}===========================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}===========================================${NC}"
    echo ""
}

# 检查 .env 文件是否存在
check_env_file() {
    if [ -f .env ]; then
        print_warning ".env 文件已存在"
        read -p "是否覆盖？[y/N]: " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "操作已取消"
            exit 0
        fi
        print_info "将覆盖现有 .env 文件"
    fi
}

# 生成随机字符串
generate_random() {
    openssl rand -base64 24 2>/dev/null || echo "change_me_$(date +%s)"
}

# 生成 JWT 密钥
generate_jwt_secret() {
    openssl rand -base64 32 2>/dev/null || echo "jwt_secret_$(date +%s)_$(openssl rand -hex 16)"
}

# 交互式配置
interactive_config() {
    print_title "配置环境变量"

    print_info "请输入配置信息（直接回车使用自动生成的随机值）"
    echo ""

    # 应用配置
    echo "=== 应用配置 ==="
    read -p "运行环境 (production/development) [production]: " NODE_ENV
    NODE_ENV=${NODE_ENV:-production}

    read -p "应用端口 [3000]: " APP_PORT
    APP_PORT=${APP_PORT:-3000}

    # MySQL 配置
    echo ""
    echo "=== MySQL 配置 ==="
    read -p "MySQL Root 密码 (自动生成): " MYSQL_ROOT_PASSWORD
    MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD:-$(generate_random)}

    read -p "数据库名 [nano_banana]: " MYSQL_DATABASE
    MYSQL_DATABASE=${MYSQL_DATABASE:-nano_banana}

    read -p "数据库用户 [nano_user]: " MYSQL_USER
    MYSQL_USER=${MYSQL_USER:-nano_user}

    read -p "数据库密码 (自动生成): " MYSQL_PASSWORD
    MYSQL_PASSWORD=${MYSQL_PASSWORD:-$(generate_random)}

    read -p "MySQL 端口 [3306]: " MYSQL_PORT
    MYSQL_PORT=${MYSQL_PORT:-3306}

    # Redis 配置
    echo ""
    echo "=== Redis 配置 ==="
    read -p "Redis 端口 [6379]: " REDIS_PORT
    REDIS_PORT=${REDIS_PORT:-6379}

    # JWT 配置
    echo ""
    echo "=== JWT 配置 ==="
    print_warning "JWT_SECRET 用于用户认证，请务必设置强密码"
    read -p "JWT 密钥 (自动生成): " JWT_SECRET
    JWT_SECRET=${JWT_SECRET:-$(generate_jwt_secret)}

    # AI API 配置
    echo ""
    echo "=== AI API 配置 ==="
    print_warning "AI_API_KEY 是必需的，请访问 https://api.fengjungpt.com 获取"
    read -p "AI API 基础 URL [https://api.fengjungpt.com]: " AI_API_BASE_URL
    AI_API_BASE_URL=${AI_API_BASE_URL:-https://api.fengjungpt.com}

    read -p "AI API Key: " AI_API_KEY

    if [ -z "$AI_API_KEY" ]; then
        print_error "AI_API_KEY 不能为空！"
        exit 1
    fi

    # 邮箱配置
    echo ""
    echo "=== 邮箱配置 (可选) ==="
    read -p "SMTP 服务器 [smtp.qq.com]: " MAIL_HOST
    MAIL_HOST=${MAIL_HOST:-smtp.qq.com}

    read -p "SMTP 端口 [465]: " MAIL_PORT
    MAIL_PORT=${MAIL_PORT:-465}

    read -p "发件邮箱: " MAIL_USER
    read -p "邮箱授权码: " MAIL_PASS

    read -p "发件人显示 [Nano Banana <noreply@nanobanana.ai>]: " MAIL_FROM
    MAIL_FROM=${MAIL_FROM:-Nano Banana <noreply@nanobanana.ai>}

    # CORS 配置
    echo ""
    echo "=== CORS 配置 ==="
    read -p "前端访问地址 (生产环境建议改为具体域名) [*]: " FRONTEND_URL
    FRONTEND_URL=${FRONTEND_URL:-*}

    # Nginx 配置
    echo ""
    echo "=== Nginx 配置 ==="
    read -p "HTTP 端口 [80]: " NGINX_HTTP_PORT
    NGINX_HTTP_PORT=${NGINX_HTTP_PORT:-80}

    read -p "HTTPS 端口 [443]: " NGINX_HTTPS_PORT
    NGINX_HTTPS_PORT=${NGINX_HTTPS_PORT:-443}
}

# 生成 .env 文件
generate_env_file() {
    print_title "生成 .env 文件"

    cat > .env << EOF
# ============================================
# Nano Banana 环境变量配置
# ============================================

# 应用配置
NODE_ENV=$NODE_ENV
APP_PORT=$APP_PORT

# MySQL 数据库配置
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD
MYSQL_DATABASE=$MYSQL_DATABASE
MYSQL_USER=$MYSQL_USER
MYSQL_PASSWORD=$MYSQL_PASSWORD
MYSQL_PORT=$MYSQL_PORT

# Redis 缓存配置
REDIS_PORT=$REDIS_PORT

# JWT 认证密钥
JWT_SECRET=$JWT_SECRET

# AI 模型 API 配置
AI_API_BASE_URL=$AI_API_BASE_URL
AI_API_KEY=$AI_API_KEY

# CORS 跨域配置
FRONTEND_URL=$FRONTEND_URL

# 邮箱配置 (SMTP)
MAIL_HOST=$MAIL_HOST
MAIL_PORT=$MAIL_PORT
MAIL_USER=$MAIL_USER
MAIL_PASS=$MAIL_PASS
MAIL_FROM=$MAIL_FROM

# Nginx 配置
NGINX_HTTP_PORT=$NGINX_HTTP_PORT
NGINX_HTTPS_PORT=$NGINX_HTTPS_PORT

# ============================================
# 配置说明
# ============================================
# 此文件包含所有环境变量配置
# 请妥善保管，不要提交到版本控制系统
#
# 必需配置：
# - MYSQL_ROOT_PASSWORD
# - MYSQL_PASSWORD
# - JWT_SECRET
# - AI_API_KEY
#
# 可选配置：
# - 邮箱配置（用于发送验证码）
#
# 启动命令：
# docker compose up -d
EOF

    print_success ".env 文件已生成"

    # 设置权限
    chmod 600 .env
    print_success "文件权限已设置为 600（仅所有者可读写）"
}

# 显示摘要
show_summary() {
    print_title "配置摘要"

    echo -e "${GREEN}✅ 应用配置${NC}"
    echo "  运行环境: $NODE_ENV"
    echo "  应用端口: $APP_PORT"
    echo ""

    echo -e "${GREEN}✅ MySQL 配置${NC}"
    echo "  数据库: $MYSQL_DATABASE"
    echo "  用户: $MYSQL_USER"
    echo "  端口: $MYSQL_PORT"
    echo "  Root 密码: ${MYSQL_ROOT_PASSWORD:0:8}***"
    echo "  数据库密码: ${MYSQL_PASSWORD:0:8}***"
    echo ""

    echo -e "${GREEN}✅ Redis 配置${NC}"
    echo "  端口: $REDIS_PORT"
    echo ""

    echo -e "${GREEN}✅ JWT 配置${NC}"
    echo "  密钥: ${JWT_SECRET:0:16}***"
    echo ""

    echo -e "${GREEN}✅ AI API 配置${NC}"
    echo "  API 地址: $AI_API_BASE_URL"
    echo "  API Key: ${AI_API_KEY:0:8}***"
    echo ""

    if [ -n "$MAIL_USER" ]; then
        echo -e "${GREEN}✅ 邮箱配置${NC}"
        echo "  SMTP: $MAIL_HOST:$MAIL_PORT"
        echo "  发件人: $MAIL_USER"
        echo ""
    fi

    print_success "配置完成！"
    echo ""
    echo -e "${YELLOW}下一步操作：${NC}"
    echo "  1. 验证配置: ./scripts/verify-docker.sh"
    echo "  2. 启动服务: docker compose up -d"
    echo "  3. 查看日志: docker compose logs -f"
    echo ""
    echo -e "${YELLOW}安全提醒：${NC}"
    echo "  - 请妥善保管 .env 文件"
    echo "  - 不要将 .env 文件提交到版本控制"
    echo "  - 定期更换密码和密钥"
    echo ""
}

# 主函数
main() {
    print_title "Nano Banana 环境变量生成器"

    # 检查是否在项目根目录
    if [ ! -f "docker-compose.yml" ]; then
        print_error "请在项目根目录运行此脚本"
        exit 1
    fi

    # 检查 .env 文件
    check_env_file

    # 交互式配置
    interactive_config

    # 生成 .env 文件
    generate_env_file

    # 显示摘要
    show_summary
}

# 显示帮助
show_help() {
    echo "Nano Banana 环境变量生成器"
    echo ""
    echo "用法："
    echo "  ./scripts/generate-env.sh [选项]"
    echo ""
    echo "选项："
    echo "  -h, --help      显示帮助信息"
    echo ""
    echo "示例："
    echo "  ./scripts/generate-env.sh       # 交互式生成 .env 文件"
    echo ""
}

# 解析命令行参数
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
