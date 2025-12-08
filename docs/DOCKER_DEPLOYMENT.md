# 🐳 Docker Compose 部署指南

本指南详细说明如何使用 Docker Compose 部署 Nano Banana AI 绘图网站。

---

## 📋 目录

1. [前置要求](#前置要求)
2. [快速开始](#快速开始)
3. [配置说明](#配置说明)
4. [部署方式](#部署方式)
5. [管理命令](#管理命令)
6. [数据持久化](#数据持久化)
7. [日志管理](#日志管理)
8. [性能优化](#性能优化)
9. [故障排除](#故障排除)
10. [生产环境部署](#生产环境部署)

---

## 前置要求

### 系统要求

- **操作系统**: Linux / macOS / Windows 10+
- **内存**: 最低 2GB，推荐 4GB+
- **磁盘**: 最低 5GB 可用空间
- **CPU**: 2 核心及以上

### 必需软件

1. **Docker Engine** (>= 20.10)
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh

   # macOS (使用 Homebrew)
   brew install --cask docker
   ```

2. **Docker Compose** (>= 2.0)
   ```bash
   # Linux (作为 Docker 插件)
   sudo apt-get update
   sudo apt-get install docker-compose-plugin

   # 验证安装
   docker compose version
   ```

3. **Git**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install git

   # macOS
   brew install git
   ```

---

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/pili1121/Nano-Banana.git
cd Nano-Banana
```

### 2. 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑配置文件（务必修改密码和密钥）
nano .env
```

**重要配置项**:
```env
# 数据库密码（请务必修改）
MYSQL_ROOT_PASSWORD=your_strong_root_password_123
MYSQL_PASSWORD=your_strong_db_password_123

# JWT 密钥（请务必修改为随机字符串）
JWT_SECRET=your_super_secret_jwt_key_$(openssl rand -base64 32)

# AI API 密钥（必须配置）
AI_API_KEY=sk-your-actual-api-key

# 邮箱配置（可选）
MAIL_USER=your_email@qq.com
MAIL_PASS=your_email_auth_code
```

### 3. 启动服务

```bash
# 构建并启动所有服务（后台运行）
docker compose up -d

# 查看实时日志
docker compose logs -f

# 等待服务启动（约 1-2 分钟）
# 首次启动会自动初始化数据库
```

### 4. 验证部署

```bash
# 检查服务状态
docker compose ps

# 查看健康检查状态
docker compose ps

# 访问应用
curl http://localhost:3000/api/health
```

看到以下响应表示部署成功：
```json
{
  "status": "ok",
  "timestamp": "2025-12-09T10:00:00.000Z",
  "version": "1.0.0"
}
```

### 5. 访问应用

打开浏览器访问 `http://localhost:3000`

---

## 配置说明

### 环境变量详解

#### 必需配置

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `MYSQL_ROOT_PASSWORD` | MySQL root 用户密码 | `StrongP@ssw0rd123` |
| `MYSQL_PASSWORD` | 应用数据库密码 | `NanoP@ssw0rd456` |
| `JWT_SECRET` | JWT 签名密钥（随机字符串） | `openssl rand -base64 32` |
| `AI_API_KEY` | AI 服务 API 密钥 | `sk-xxxxxxxxxxxxx` |

#### 可选配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `NODE_ENV` | 运行环境 | `production` |
| `APP_PORT` | 应用端口 | `3000` |
| `MYSQL_PORT` | MySQL 端口 | `3306` |
| `REDIS_PORT` | Redis 端口 | `6379` |
| `MAIL_HOST` | SMTP 服务器 | `smtp.qq.com` |
| `MAIL_PORT` | SMTP 端口 | `465` |
| `MAIL_USER` | 发件邮箱 | `your_email@qq.com` |
| `MAIL_PASS` | 邮箱授权码 | `your_auth_code` |
| `FRONTEND_URL` | 前端访问地址 | `*` |

### Docker Compose 服务

#### app (应用服务)

- **端口**: 3000
- **环境**: 基于 `.env` 文件
- **依赖**: MySQL, Redis
- **数据卷**: uploads, logs
- **健康检查**: `/api/health` 端点

#### mysql (数据库服务)

- **镜像**: `mysql:5.7`
- **端口**: 3306
- **数据持久化**: `mysql_data` 卷
- **初始化**: 自动导入 `database.sql`

#### redis (缓存服务)

- **镜像**: `redis:6-alpine`
- **端口**: 6379
- **数据持久化**: `redis_data` 卷
- **用途**: 会话存储、缓存

#### nginx (反向代理)

- **镜像**: `nginx:alpine`
- **端口**: 80, 443
- **用途**: 反向代理、SSL 终端
- **启用方式**: `--profile production`

---

## 部署方式

### 方式一：开发环境

```bash
# 启动所有服务（不包含 nginx）
docker compose up -d

# 查看日志
docker compose logs -f app
```

### 方式二：生产环境（包含 Nginx）

```bash
# 启动所有服务（包括 nginx）
docker compose --profile production up -d

# 使用 SSL/HTTPS（需先配置证书）
# 1. 将证书文件放在 nginx/ssl/ 目录
# 2. 取消注释 nginx.conf 中的 HTTPS 配置
# 3. 重启服务
docker compose restart nginx
```

### 方式三：仅启动数据库

```bash
# 单独启动数据库服务
docker compose up -d mysql redis

# 然后手动启动应用（用于调试）
docker compose run --rm app npm start
```

---

## 管理命令

### 服务管理

```bash
# 启动所有服务
docker compose up -d

# 停止所有服务
docker compose down

# 重启服务
docker compose restart

# 重启特定服务
docker compose restart app

# 查看服务状态
docker compose ps

# 查看服务日志
docker compose logs -f [service_name]

# 查看特定服务日志
docker compose logs -f app
docker compose logs -f mysql
docker compose logs -f redis
```

### 构建相关

```bash
# 重新构建镜像
docker compose build

# 强制重新构建
docker compose build --no-cache

# 仅构建应用镜像
docker compose build app
```

### 清理相关

```bash
# 停止并删除所有容器
docker compose down -v

# 删除所有数据卷（危险！）
docker compose down -v --remove-orphans使用的镜像
docker image prune -

# 删除未a

# 完全清理使用）
docker system（谨慎 prune -a --volumes
```

```bash
# 备份数据库### 数据库管理


docker compose exec mysql mysqldump -u root -p nano_banana > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复数据库
cat backup_20251209_120000.sql | docker compose exec -T mysql mysql -u root -p nano_banana

# 连接 MySQL
docker compose exec mysql mysql -u root -p nano_banana

# 执行 SQL
docker compose exec -T mysql mysql -u root -p nano_banana -e "SELECT * FROM users;"
```

### 进入容器

```bash
# 进入应用容器
docker compose exec app sh

# 进入 MySQL 容器
docker compose exec mysql bash

# 进入 Redis 容器
docker compose exec redis sh

# 以 root 身份进入
docker compose exec --user root app sh
```

---

## 数据持久化

### 数据卷

Docker Compose 使用以下数据卷持久化数据：

| 卷名 | 用途 | 路径 |
|------|------|------|
| `nano-banana-mysql-data` | MySQL 数据 | `/var/lib/mysql` |
| `nano-banana-redis-data` | Redis 数据 | `/data` |
| `nano-banana-uploads` | 用户上传文件 | `/app/uploads` |
| `nano-banana-nginx-logs` | Nginx 日志 | `/var/log/nginx` |

### 备份数据

#### 方法一：使用 Docker 命令

```bash
# 备份 MySQL 数据
docker run --rm --volumes-from nano-banana-mysql \
  -v $(pwd):/backup \
  mysql:5.7 \
  sh -c "mysqldump -u root -p nano_banana > /backup/mysql_backup_$(date +%Y%m%d_%H%M%S).sql"

# 备份上传文件
docker run --rm --volumes-from nano-banana-app \
  -v $(pwd):/backup \
  alpine \
  tar czf /backup/uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz /app/uploads
```

#### 方法二：直接复制卷

```bash
# 创建临时容器访问卷
docker run --rm -v nano-banana-mysql-data:/data -v $(pwd):/backup alpine \
  tar czf /backup/mysql_vol_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .

# 恢复数据
docker run --rm -v nano-banana-mysql-data:/data -v $(pwd):/backup alpine \
  tar xzf /backup/mysql_vol_backup_20251209_120000.tar.gz -C /data
```

---

## 日志管理

### 查看日志

```bash
# 查看所有服务日志
docker compose logs

# 实时查看应用日志
docker compose logs -f app

# 查看最近 100 行日志
docker compose logs --tail=100 app

# 查看特定时间范围的日志
docker compose logs --since="2025-12-09T10:00:00" app
```

### 日志轮转

Docker Compose 使用 JSON File 日志驱动。配置日志轮转：

```yaml
# 在 docker-compose.yml 中添加
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 日志文件位置

- **应用日志**: `docker compose logs app` 或 `./logs/`
- **MySQL 日志**: `docker compose exec mysql cat /var/log/mysql/error.log`
- **Nginx 日志**: `./nginx_logs/` 或 `docker compose exec nginx cat /var/log/nginx/access.log`

---

## 性能优化

### 1. 资源限制

在 `docker-compose.yml` 中添加资源限制：

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

  mysql:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 2. MySQL 优化

创建自定义 MySQL 配置：

```bash
# 创建自定义配置
mkdir -p mysql/conf.d
cat > mysql/conf.d/custom.cnf << EOF
[mysqld]
innodb_buffer_pool_size = 512M
innodb_log_file_size = 128M
max_connections = 200
query_cache_size = 64M
EOF

# 在 docker-compose.yml 中挂载
volumes:
  - ./mysql/conf.d:/etc/mysql/conf.d:ro
```

### 3. Redis 优化

```yaml
services:
  redis:
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
```

### 4. 应用层优化

在 `.env` 中配置：

```env
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=512
```

---

## 故障排除

### 常见问题

#### 1. 端口被占用

```bash
# 查看端口占用
sudo netstat -tulpn | grep :3000

# 杀死占用进程
sudo kill -9 <PID>

# 或修改 .env 中的端口
APP_PORT=3001
```

#### 2. 数据库连接失败

```bash
# 检查 MySQL 状态
docker compose exec mysql mysqladmin ping -h localhost -u root -p

# 查看 MySQL 日志
docker compose logs mysql

# 检查网络连接
docker compose exec app nc -zv mysql 3306
```

#### 3. 容器启动失败

```bash
# 查看容器日志
docker compose logs app

# 进入容器调试
docker compose exec app sh

# 检查配置文件
docker compose exec app cat /app/.env
```

#### 4. 内存不足

```bash
# 查看资源使用
docker stats

# 清理未使用资源
docker system prune -a

# 释放内存
echo 3 | sudo tee /proc/sys/vm/drop_caches
```

#### 5. 磁盘空间不足

```bash
# 查看磁盘使用
docker system df

# 清理日志
docker compose exec app sh -c "find /app/logs -type f -mtime +7 -delete"

# 清理未使用镜像
docker image prune -a
```

### 调试命令

```bash
# 查看所有容器状态
docker ps -a

# 查看网络
docker network ls
docker network inspect nano-banana-network

# 查看数据卷
docker volume ls
docker volume inspect nano-banana-mysql-data

# 检查 DNS 解析
docker compose exec app nslookup mysql

# 检查端口连通性
docker compose exec app nc -zv mysql 3306
```

---

## 生产环境部署

### 安全建议

1. **修改默认密码**
   ```env
   MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32)
   MYSQL_PASSWORD=$(openssl rand -base64 32)
   JWT_SECRET=$(openssl rand -base64 64)
   ```

2. **使用 secrets**（生产环境推荐）

   ```yaml
   # docker-compose.secrets.yml
   version: '3.8'
   secrets:
     mysql_root_password:
       file: ./secrets/mysql_root_password.txt
     mysql_password:
       file: ./secrets/mysql_password.txt
     jwt_secret:
       file: ./secrets/jwt_secret.txt

   services:
     app:
       secrets:
         - jwt_secret
       environment:
         - JWT_SECRET_FILE=/run/secrets/jwt_secret

     mysql:
       secrets:
         - mysql_root_password
         - mysql_password
       environment:
         - MYSQL_ROOT_PASSWORD_FILE=/run/secrets/mysql_root_password
   ```

3. **防火墙配置**

   ```bash
   # 仅开放必要端口
   sudo ufw allow 22    # SSH
   sudo ufw allow 80    # HTTP
   sudo ufw allow 443   # HTTPS
   sudo ufw enable
   ```

4. **启用 SSL/HTTPS**

   - 将证书放在 `nginx/ssl/` 目录
   - 取消注释 `nginx.conf` 中的 HTTPS 配置
   - 重启 nginx: `docker compose restart nginx`

### 监控

#### 1. 使用 Watchtower 自动更新

```yaml
# docker-compose.override.yml
version: '3.8'
services:
  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_POLL_INTERVAL=86400  # 24 小时
```

#### 2. 资源监控

```bash
# 使用 cAdvisor 监控
docker run -d \
  --name=cadvisor \
  --privileged \
  -v /:/rootfs:ro \
  -v /var/run:/var/run:ro \
  -v /sys:/sys:ro \
  -v /var/lib/docker/:/var/lib/docker:ro \
  -p 8080:8080 \
  gcr.io/cadvisor/cadvisor
```

### 备份策略

创建备份脚本 `backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/nano-banana"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
docker compose exec -T mysql mysqldump -u root -p nano_banana \
  | gzip > $BACKUP_DIR/mysql_$DATE.sql.gz

# 备份上传文件
docker run --rm -v nano-banana-uploads:/data -v $BACKUP_DIR:/backup alpine \
  tar czf /backup/uploads_$DATE.tar.gz -C /data .

# 删除 7 天前的备份
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

设置定时任务：

```bash
# 每天凌晨 3 点备份
crontab -e
0 3 * * * /path/to/backup.sh >> /var/log/backup.log 2>&1
```

---

## 参考资源

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 官方文档](https://docs.docker.com/compose/)
- [MySQL Docker 镜像](https://hub.docker.com/_/mysql)
- [Redis Docker 镜像](https://hub.docker.com/_/redis)
- [Nginx Docker 镜像](https://hub.docker.com/_/nginx)

---

**祝部署顺利！** 🎉
