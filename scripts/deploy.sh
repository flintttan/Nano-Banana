#!/bin/bash

# ============================================
# Nano Banana AI 绘图网站
# Docker Compose 快速部署脚本
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
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

# 打印标题
print_title() {
    echo ""
    echo -e "${BLUE}===========================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}===========================================${NC}"
    echo ""
}

# 检查依赖
check_dependencies() {
    print_title "检查系统依赖"

    # 检查 Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装！请先安装 Docker"
        echo "安装指南：https://docs.docker.com/engine/install/"
        exit 1
    fi
    print_success "Docker 已安装: $(docker --version)"

    # 检查 Docker Compose
    if ! command -v docker compose &> /dev/null; then
        print_error "Docker Compose 未安装！请先安装 Docker Compose"
        echo "安装指南：https://docs.docker.com/compose/install/"
        exit 1
    fi
    print_success "Docker Compose 已安装: $(docker compose version --short)"
}

# 配置环境变量
setup_env() {
    print_title "配置环境变量"

    if [ ! -f .env ]; then
        print_info "复制环境变量文件..."
        cp .env.example .env
        print_success "已创建 .env 文件"

        # 生成随机密码
        JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "change_this_jwt_secret_$(date +%s)")
        MYSQL_ROOT_PASSWORD=$(openssl rand -base64 24 2>/dev/null || echo "root_password_$(date +%s)")
        MYSQL_PASSWORD=$(openssl rand -base64 24 2>/dev/null || echo "nano_password_$(date +%s)")

        # 更新 .env 文件
        sed -i.bak "s/your_jwt_secret_key_change_this_to_a_long_random_string/$JWT_SECRET/g" .env
        sed -i.bak "s/your_root_password_123/$MYSQL_ROOT_PASSWORD/g" .env
        sed -i.bak "s/your_nano_password_123/$MYSQL_PASSWORD/g" .env

        print_warning "请编辑 .env 文件，配置以下必需项："
        echo "  - AI_API_KEY: 您的 AI API 密钥"
        echo "  - MAIL_USER: 您的邮箱地址（可选）"
        echo "  - MAIL_PASS: 您的邮箱授权码（可选）"
        echo ""

        read -p "配置完成后按 Enter 继续，或 Ctrl+C 取消..."
    else
        print_success ".env 文件已存在"
    fi
}

# 拉取镜像
pull_images() {
    print_title "拉取 Docker 镜像"

    print_info "拉取 MySQL 5.7 镜像..."
    docker pull mysql:5.7

    print_info "拉取 Redis 6 镜像..."
    docker pull redis:6-alpine

    print_info "拉取 Nginx Alpine 镜像..."
    docker pull nginx:alpine

    print_success "所有镜像拉取完成"
}

# 构建应用
build_app() {
    print_title "构建应用镜像"

    print_info "构建 Nano Banana 应用镜像..."
    docker compose build --no-cache

    print_success "应用镜像构建完成"
}

# 启动服务
start_services() {
    print_title "启动服务"

    # 询问部署模式
    echo "请选择部署模式："
    echo "  1) 开发环境（仅应用+数据库+缓存）"
    echo "  2) 生产环境（包含 Nginx 反向代理）"
    read -p "请输入选择 [1-2]: " choice

    case $choice in
        1)
            print_info "启动开发环境服务..."
            docker compose up -d
            ;;
        2)
            print_info "启动生产环境服务（包含 Nginx）..."
            docker compose --profile production up -d
            ;;
        *)
            print_warning "无效选择，启动开发环境..."
            docker compose up -d
            ;;
    esac

    print_success "所有服务已启动"
}

# 等待服务就绪
wait_for_services() {
    print_title "等待服务就绪"

    print_info "等待 MySQL 启动（约 30 秒）..."
    timeout=60
    counter=0
    while [ $counter -lt $timeout ]; do
        if docker compose exec -T mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
            print_success "MySQL 已就绪"
            break
        fi
        counter=$((counter + 1))
        sleep 1
    done

    if [ $counter -eq $timeout ]; then
        print_error "MySQL 启动超时"
        exit 1
    fi

    print_info "等待应用启动（约 30 秒）..."
    sleep 30

    print_success "所有服务已就绪"
}

# 验证部署
verify_deployment() {
    print_title "验证部署"

    # 检查容器状态
    print_info "检查容器状态..."
    if docker compose ps | grep -q "Up"; then
        print_success "容器运行正常"
    else
        print_error "容器未正常运行"
        docker compose ps
        return 1
    fi

    # 健康检查
    print_info "执行健康检查..."
    sleep 5
    if curl -s http://localhost:3000/api/health > /dev/null; then
        print_success "应用健康检查通过"
        echo ""
        echo -e "${GREEN}===========================================${NC}"
        echo -e "${GREEN}  部署成功！${NC}"
        echo -e "${GREEN}===========================================${NC}"
        echo ""
        echo "访问地址：http://localhost:3000"
        echo ""
        echo "管理命令："
        echo "  查看日志：  docker compose logs -f"
        echo "  停止服务：  docker compose down"
        echo "  重启服务：  docker compose restart"
        echo "  查看状态：  docker compose ps"
        echo ""
    else
        print_error "应用健康检查失败"
        print_info "查看错误日志："
        docker compose logs app
        return 1
    fi
}

# 显示帮助信息
show_help() {
    echo "Nano Banana AI 绘图网站 - Docker Compose 部署脚本"
    echo ""
    echo "用法："
    echo "  ./deploy.sh [选项]"
    echo ""
    echo "选项："
    echo "  -h, --help      显示帮助信息"
    echo "  --no-build      跳过构建步骤（仅启动服务）"
    echo "  --dev           开发环境模式（默认）"
    echo "  --prod          生产环境模式（包含 Nginx）"
    echo ""
    echo "示例："
    echo "  ./deploy.sh                    # 交互式部署"
    echo "  ./deploy.sh --prod             # 直接部署生产环境"
    echo "  ./deploy.sh --no-build         # 仅启动现有容器"
    echo ""
}

# 主函数
main() {
    # 解析命令行参数
    SKIP_BUILD=false
    DEPLOY_MODE="interactive"

    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            --no-build)
                SKIP_BUILD=true
                shift
                ;;
            --dev)
                DEPLOY_MODE="dev"
                shift
                ;;
            --prod)
                DEPLOY_MODE="prod"
                shift
                ;;
            *)
                print_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done

    print_title "Nano Banana AI 绘图网站"
    print_info "Docker Compose 部署脚本"

    # 检查依赖
    check_dependencies

    # 设置环境变量
    setup_env

    # 拉取镜像
    pull_images

    # 构建应用（除非跳过）
    if [ "$SKIP_BUILD" = false ]; then
        build_app
    fi

    # 启动服务
    if [ "$DEPLOY_MODE" = "interactive" ]; then
        start_services
        wait_for_services
        verify_deployment
    elif [ "$DEPLOY_MODE" = "dev" ]; then
        print_info "启动开发环境..."
        docker compose up -d
        wait_for_services
        verify_deployment
    elif [ "$DEPLOY_MODE" = "prod" ]; then
        print_info "启动生产环境..."
        docker compose --profile production up -d
        wait_for_services
        verify_deployment
    fi
}

# 执行主函数
main "$@"
