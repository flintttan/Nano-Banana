# 🐳 Nano Banana Docker 部署指南

## 📋 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 2GB 可用内存
- 至少 5GB 可用磁盘空间

## 🚀 快速启动

### 1. 配置环境变量

首次运行前，需要配置环境变量：

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，修改以下关键配置：
nano .env
```

**必须修改的配置项：**

```env
# JWT 密钥（务必修改为复杂的随机字符串）
JWT_SECRET=your_jwt_secret_key_change_this_to_a_long_random_string

# AI API 配置
AI_API_BASE_URL=https://api-host
AI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# MySQL 数据库密码
MYSQL_ROOT_PASSWORD=your_root_password_123
MYSQL_PASSWORD=nano_password_123
```

### 2. 使用启动脚本（推荐）

```bash
# 赋予执行权限
chmod +x docker-start.sh

# 运行启动脚本
./docker-start.sh
```

### 3. 手动启动

```bash
# 创建必要的目录
mkdir -p data/{mysql,redis,uploads,logs}

# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f app
```

## 📦 服务架构

Docker Compose 会启动以下服务：

| 服务 | 容器名 | 端口 | 说明 |
|------|--------|------|------|
| **app** | nano-banana-app | 3000 | Node.js 应用主服务 |
| **mysql** | nano-banana-mysql | 3306 | MySQL 8.0 数据库 |
| **redis** | nano-banana-redis | 6379 | Redis 缓存服务 |
| **nginx** | nano-banana-nginx | 80/443 | Nginx 反向代理（可选） |

## 🔧 常用命令

### 服务管理

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 重启服务
docker-compose restart

# 重启单个服务
docker-compose restart app

# 停止并删除所有数据（包括数据库）
docker-compose down -v
```

### 日志查看

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看应用日志
docker-compose logs -f app

# 查看 MySQL 日志
docker-compose logs -f mysql

# 查看最近 100 行日志
docker-compose logs --tail=100 app
```

### 进入容器

```bash
# 进入应用容器
docker-compose exec app sh

# 进入 MySQL 容器
docker-compose exec mysql bash

# 连接 MySQL 数据库
docker-compose exec mysql mysql -u nano_user -p nano_banana
```

### 数据库管理

```bash
# 导出数据库
docker-compose exec mysql mysqldump -u nano_user -p nano_banana > backup.sql

# 导入数据库
docker-compose exec -T mysql mysql -u nano_user -p nano_banana < backup.sql

# 重新初始化数据库（会删除所有数据）
docker-compose down -v
docker-compose up -d
```

## 🔍 健康检查

所有服务都配置了健康检查：

```bash
# 查看服务健康状态
docker-compose ps

# 检查应用健康端点
curl http://localhost:3000/api/health
```

## 📁 数据持久化

数据存储在 `data/` 目录下：

```
data/
├── mysql/      # MySQL 数据文件
├── redis/      # Redis 持久化数据
├── uploads/    # 用户上传的图片
└── logs/       # 应用日志
```

**⚠️ 重要提示：**
- 定期备份 `data/` 目录
- 不要删除 `data/mysql/` 目录，否则会丢失所有数据
- `data/uploads/` 包含所有生成的图片

## 🌐 生产环境部署

### 启用 Nginx 反向代理

```bash
# 创建 Nginx 配置文件
mkdir -p nginx
nano nginx/nginx.conf

# 使用 production profile 启动
docker-compose --profile production up -d
```

### SSL 证书配置

```bash
# 将 SSL 证书放入 nginx/ssl/ 目录
cp your-cert.crt nginx/ssl/
cp your-key.key nginx/ssl/

# 修改 nginx.conf 配置 SSL
# 重启 Nginx
docker-compose restart nginx
```

### 环境变量优化

生产环境建议修改：

```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443
```

## 🐛 故障排查

### 应用无法启动

```bash
# 查看详细日志
docker-compose logs app

# 检查环境变量
docker-compose exec app env | grep -E "DB_|AI_|JWT_"

# 重新构建镜像
docker-compose build --no-cache app
docker-compose up -d
```

### 数据库连接失败

```bash
# 检查 MySQL 是否健康
docker-compose ps mysql

# 查看 MySQL 日志
docker-compose logs mysql

# 测试数据库连接
docker-compose exec mysql mysql -u nano_user -p -e "SELECT 1"
```

### 端口冲突

如果端口被占用，修改 `.env` 文件：

```env
APP_PORT=3001
MYSQL_PORT=3307
REDIS_PORT=6380
```

### 磁盘空间不足

```bash
# 清理未使用的 Docker 资源
docker system prune -a

# 清理旧的日志文件
rm -rf data/logs/*.log

# 查看磁盘使用情况
du -sh data/*
```

## 🔄 更新应用

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose build app
docker-compose up -d app

# 查看更新日志
docker-compose logs -f app
```

## 📊 性能监控

```bash
# 查看容器资源使用情况
docker stats

# 查看特定容器的资源使用
docker stats nano-banana-app

# 查看容器详细信息
docker inspect nano-banana-app
```

## 🔐 安全建议

1. **修改默认密码**：务必修改 `.env` 中的所有密码
2. **限制端口访问**：生产环境只暴露必要的端口
3. **使用 HTTPS**：配置 SSL 证书
4. **定期备份**：自动化备份数据库和上传文件
5. **更新依赖**：定期更新 Docker 镜像和应用依赖

## 📞 获取帮助

如遇到问题，请：

1. 查看日志：`docker-compose logs -f`
2. 检查服务状态：`docker-compose ps`
3. 查看健康检查：`curl http://localhost:3000/api/health`

---

**祝您使用愉快！🎉**
