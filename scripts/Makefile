# Nano Banana AI 绘图网站 - Docker Compose 管理脚本

# 颜色定义
BLUE=\033[0;34m
GREEN=\033[0;32m
YELLOW=\033[1;33m
RED=\033[0;31m
NC=\033[0m # No Color

.PHONY: help up down restart logs status clean build health backup restore

# 默认目标
help: ## 显示帮助信息
	@echo "$(BLUE)Nano Banana AI 绘图网站 - Docker Compose 管理$(NC)"
	@echo ""
	@echo "$(GREEN)可用命令:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(GREEN)示例:$(NC)"
	@echo "  make up         # 启动所有服务"
	@echo "  make logs       # 查看日志"
	@echo "  make clean      # 清理所有容器和数据"
	@echo ""

up: ## 启动所有服务（开发环境）
	@echo "$(BLUE)[INFO]$(NC) 启动开发环境服务..."
	docker compose up -d
	@echo ""
	@echo "$(GREEN)[SUCCESS]$(NC) 所有服务已启动"
	@echo "$(GREEN)[SUCCESS]$(NC) 访问地址: http://localhost:3000"
	@echo ""
	@echo "$(YELLOW)提示:$(NC) 使用 'make logs' 查看实时日志"

up-prod: ## 启动所有服务（生产环境，包含 Nginx）
	@echo "$(BLUE)[INFO]$(NC) 启动生产环境服务（包含 Nginx）..."
	docker compose --profile production up -d
	@echo ""
	@echo "$(GREEN)[SUCCESS]$(NC) 所有服务已启动"
	@echo "$(GREEN)[SUCCESS]$(NC) 访问地址: http://localhost"
	@echo ""

down: ## 停止所有服务
	@echo "$(BLUE)[INFO]$(NC) 停止所有服务..."
	docker compose down
	@echo "$(GREEN)[SUCCESS]$(NC) 所有服务已停止"

restart: ## 重启所有服务
	@echo "$(BLUE)[INFO]$(NC) 重启所有服务..."
	docker compose restart
	@echo "$(GREEN)[SUCCESS]$(NC) 所有服务已重启"

restart-app: ## 仅重启应用服务
	@echo "$(BLUE)[INFO]$(NC) 重启应用服务..."
	docker compose restart app
	@echo "$(GREEN)[SUCCESS]$(NC) 应用服务已重启"

logs: ## 查看所有服务的实时日志
	docker compose logs -f

logs-app: ## 查看应用服务的实时日志
	docker compose logs -f app

logs-mysql: ## 查看 MySQL 的实时日志
	docker compose logs -f mysql

logs-redis: ## 查看 Redis 的实时日志
	docker compose logs -f redis

status: ## 查看所有服务状态
	@echo "$(BLUE)服务状态:$(NC)"
	docker compose ps
	@echo ""
	@echo "$(BLUE)资源使用:$(NC)"
	@docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

build: ## 构建应用镜像
	@echo "$(BLUE)[INFO]$(NC) 构建应用镜像..."
	docker compose build --no-cache
	@echo "$(GREEN)[SUCCESS]$(NC) 镜像构建完成"

build-no-cache: ## 强制重新构建所有镜像
	@echo "$(BLUE)[INFO]$(NC) 强制重新构建所有镜像..."
	docker compose build --no-cache --pull
	@echo "$(GREEN)[SUCCESS]$(NC) 镜像构建完成"

health: ## 检查服务健康状态
	@echo "$(BLUE)健康检查:$(NC)"
	@curl -s http://localhost:3000/api/health | python3 -m json.tool 2>/dev/null || \
		curl -s http://localhost:3000/api/health
	@echo ""
	@echo "$(BLUE)MySQL 连接:$(NC)"
	@docker compose exec -T mysql mysqladmin ping -h localhost --silent 2>/dev/null && \
		echo "$(GREEN)OK$(NC)" || echo "$(RED)FAIL$(NC)"
	@echo ""
	@echo "$(BLUE)Redis 连接:$(NC)"
	@docker compose exec -T redis redis-cli ping 2>/dev/null | grep -q PONG && \
		echo "$(GREEN)OK$(NC)" || echo "$(RED)FAIL$(NC)"

shell: ## 进入应用容器
	docker compose exec app sh

shell-mysql: ## 进入 MySQL 容器
	docker compose exec mysql bash

shell-redis: ## 进入 Redis 容器
	docker compose exec redis sh

backup: ## 备份数据库和上传文件
	@DATE=$$(date +%Y%m%d_%H%M%S); \
	echo "$(BLUE)[INFO]$(NC) 备份数据库和文件 ($$DATE)..."; \
	mkdir -p backups; \
	$(MAKE) backup-mysql DATE=$$DATE; \
	$(MAKE) backup-uploads DATE=$$DATE; \
	echo "$(GREEN)[SUCCESS]$(NC) 备份完成: backups/"

backup-mysql: ## 备份 MySQL 数据库
	@DATE=$${DATE:-$$(date +%Y%m%d_%H%M%S)}; \
	echo "$(BLUE)[INFO]$(NC) 备份 MySQL 数据库..."; \
	docker compose exec -T mysql mysqldump -u root -p nano_banana \
		| gzip > backups/mysql_backup_$${DATE}.sql.gz; \
	echo "$(GREEN)[SUCCESS]$(NC) MySQL 备份完成: backups/mysql_backup_$${DATE}.sql.gz"

backup-uploads: ## 备份上传文件
	@DATE=$${DATE:-$$(date +%Y%m%d_%H%M%S)}; \
	echo "$(BLUE)[INFO]$(NC) 备份上传文件..."; \
	docker run --rm -v nano-banana-uploads:/data -v $$(pwd)/backups:/backup \
		alpine tar czf /backup/uploads_backup_$${DATE}.tar.gz -C /data .; \
	echo "$(GREEN)[SUCCESS]$(NC) 上传文件备份完成: backups/uploads_backup_$${DATE}.tar.gz"

restore: ## 恢复数据库（需要指定备份文件）
	@echo "$(YELLOW)可用备份文件:$(NC)"; \
	@ls -lh backups/*.sql.gz 2>/dev/null || echo "  无备份文件"; \
	@echo ""; \
	read -p "请输入备份文件名: " FILE; \
	if [ ! -f "backups/$$FILE" ]; then \
		echo "$(RED)[ERROR]$(NC) 备份文件不存在"; \
		exit 1; \
	fi; \
	echo "$(BLUE)[INFO]$(NC) 恢复数据库..."; \
	zcat backups/$$FILE | docker compose exec -T mysql mysql -u root -p nano_banana; \
	echo "$(GREEN)[SUCCESS]$(NC) 数据库恢复完成"

clean: ## 清理所有容器和数据（危险！）
	@echo "$(RED)[WARNING]$(NC) 此操作将删除所有容器和数据！"; \
	read -p "确认继续？[y/N] " -n 1 -r; \
	echo ""; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose down -v --remove-orphans; \
		echo "$(GREEN)[SUCCESS]$(NC) 所有容器和数据已清理"; \
	else \
		echo "$(YELLOW)[INFO]$(NC) 操作已取消"; \
	fi

clean-images: ## 删除所有相关镜像
	@echo "$(RED)[WARNING]$(NC) 此操作将删除所有相关镜像！"; \
	read -p "确认继续？[y/N] " -n 1 -r; \
	echo ""; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose down -v --remove-orphans; \
		docker image rm -f $$(docker images | grep "nano-banana\|mysql\|redis\|nginx" | awk '{print $$3}' | sort -u); \
		echo "$(GREEN)[SUCCESS]$(NC) 所有镜像已删除"; \
	else \
		echo "$(YELLOW)[INFO]$(NC) 操作已取消"; \
	fi

clean-logs: ## 清理所有日志文件
	@echo "$(BLUE)[INFO]$(NC) 清理日志文件..."
	docker compose exec -T app sh -c "find /app/logs -type f -mtime +7 -delete" 2>/dev/null || true
	echo "$(GREEN)[SUCCESS]$(NC) 日志清理完成"

prune: ## 清理未使用的 Docker 资源
	@echo "$(BLUE)[INFO]$(NC) 清理未使用的 Docker 资源..."
	docker system prune -f
	echo "$(GREEN)[SUCCESS]$(NC) 清理完成"

env: ## 显示当前环境变量（隐藏敏感信息）
	@echo "$(BLUE)环境配置:$(NC)"
	@grep -E "^(NODE_ENV|APP_PORT|MYSQL_PORT|REDIS_PORT|FRONTEND_URL|MAIL_HOST)" .env 2>/dev/null || echo "  .env 文件不存在"
	@echo ""
	@echo "$(YELLOW)敏感信息已隐藏$(NC)"

env-edit: ## 编辑环境变量文件
	@if [ -f .env ]; then \
		$$EDITOR .env; \
	else \
		echo "$(RED)[ERROR]$(NC) .env 文件不存在，请先运行 'make setup'"; \
	fi

setup: ## 初始化项目（创建 .env 文件）
	@if [ ! -f .env ]; then \
		echo "$(BLUE)[INFO]$(NC) 创建 .env 文件..."; \
		cp .env.example .env; \
		echo "$(GREEN)[SUCCESS]$(NC) .env 文件已创建，请编辑配置"; \
		echo "$(YELLOW)提示:$(NC) 使用 'make env-edit' 编辑环境变量"; \
	else \
		echo "$(YELLOW)[INFO]$(NC) .env 文件已存在"; \
	fi

update: ## 更新镜像和重启服务
	@echo "$(BLUE)[INFO]$(NC) 更新镜像..."
	docker compose pull
	@echo "$(BLUE)[INFO]$(NC) 重新构建应用镜像..."
	docker compose build app
	@echo "$(BLUE)[INFO]$(NC) 重启服务..."
	docker compose up -d
	@echo "$(GREEN)[SUCCESS]$(NC) 更新完成"

install: ## 安装依赖（本地开发）
	@echo "$(BLUE)[INFO]$(NC) 安装 Node.js 依赖..."
	npm install

# 开发辅助命令
dev: ## 启动开发模式（实时重建）
	@echo "$(BLUE)[INFO]$(NC) 启动开发模式..."
	docker compose up -d --build app

test: ## 运行测试
	@echo "$(BLUE)[INFO]$(NC) 运行测试..."
	docker compose exec app npm test

# 显示服务信息
info: ## 显示服务信息
	@echo "$(BLUE)===========================================$(NC)"
	@echo "$(BLUE)  Nano Banana AI 绘图网站$(NC)"
	@echo "$(BLUE)===========================================$(NC)"
	@echo ""
	@echo "$(GREEN)服务地址:$(NC)"
	@echo "  应用主页:      http://localhost:3000"
	@echo "  健康检查:      http://localhost:3000/api/health"
	@echo "  MySQL:         localhost:3306"
	@echo "  Redis:         localhost:6379"
	@echo ""
	@echo "$(GREEN)常用命令:$(NC)"
	@echo "  make up              启动服务"
	@echo "  make down            停止服务"
	@echo "  make logs            查看日志"
	@echo "  make status          查看状态"
	@echo "  make backup          备份数据"
	@echo ""
	@echo "$(GREEN)更多信息:$(NC)"
	@echo "  查看帮助:           make help"
	@echo "  完整文档:           cat README.docker.md"
	@echo ""
