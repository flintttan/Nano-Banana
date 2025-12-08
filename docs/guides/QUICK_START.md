# 🚀 快速开始指南

欢迎使用 Nano BananaAI！本指南将帮助您快速部署应用。

---

## 📋 目录

1. [环境要求](#环境要求)
2. [一键部署](#一键部署)
3. [配置说明](#配置说明)
4. [验证部署](#验证部署)
5. [访问应用](#访问应用)
6. [管理命令](#管理命令)
7. [故障排除](#故障排除)

---

## 环境要求

- **Docker**: >= 20.10
- **Docker Compose**: >= 2.0
- **内存**: >= 2GB
- **磁盘**: >= 5GB

---

## 一键部署

### 方式一：使用环境变量生成器（推荐⭐）

```bash
# 1. 运行环境变量生成器（自动生成安全配置）
./scripts/generate-env.sh

# 2. 启动服务
docker compose up -d

# 3. 完成！
```

**生成器会**：
- ✅ 引导您输入配置（或使用默认值）
- ✅ 自动生成强密码
- ✅ 自动生成 JWT 密钥
- ✅ 验证必需配置

### 方式二：使用自动部署脚本

```bash
# 运行自动部署脚本
./scripts/deploy.sh

# 按照提示完成配置
```

### 方式三：快速启动（高级用户）

```bash
# 1. 复制环境变量文件
cp .env.example .env

# 2. 编辑 .env，设置必需变量
nano .env

# 至少需要设置：
# - MYSQL_ROOT_PASSWORD
# - MYSQL_PASSWORD
# - JWT_SECRET
# - AI_API_KEY

# 3. 启动服务
docker compose up -d
```

---

## 配置说明

### 必需配置

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `MYSQL_ROOT_PASSWORD` | MySQL Root 密码 | `StrongP@ssw0rd123` |
| `MYSQL_PASSWORD` | 数据库密码 | `NanoP@ssw0rd456` |
| `JWT_SECRET` | JWT 签名密钥 | `openssl rand -base64 32` |
| `AI_API_KEY` | AI API 密钥 | `sk-xxxxxxxx` |

### 可选配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `NODE_ENV` | 运行环境 | `production` |
| `APP_PORT` | 应用端口 | `3000` |
| `MAIL_*` | 邮箱配置 | - |
| `FRONTEND_URL` | 前端地址 | `*` |

### 生成安全配置

```bash
# 使用生成器（推荐）
./scripts/generate-env.sh

# 或手动生成
echo "MYSQL_ROOT_PASSWORD=$(openssl rand -base64 24)" >> .env
echo "MYSQL_PASSWORD=$(openssl rand -base64 24)" >> .env
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
```

---

## 验证部署

### 1. 检查服务状态

```bash
docker compose ps
```

**期望输出**：
```
NAME                   STATUS
nano-banana-app        Up (healthy)
nano-banana-mysql      Up (healthy)
nano-banana-redis      Up (healthy)
```

### 2. 检查健康状态

```bash
curl http://localhost:3000/api/health
```

**期望输出**：
```json
{
  "status": "ok",
  "timestamp": "2025-12-09T00:00:00.000Z",
  "version": "1.0.0"
}
```

### 3. 查看日志

```bash
# 查看应用日志
docker compose logs -f app

# 查看所有日志
docker compose logs
```

---

## 访问应用

### Web 界面

- **主页**: http://localhost:3000
- **登录页**: http://localhost:3000/login.html

### API 端点

- **健康检查**: http://localhost:3000/api/health
- **用户注册**: POST http://localhost:3000/api/auth/register
- **用户登录**: POST http://localhost:3000/api/auth/login
- **生成图片**: POST http://localhost:3000/api/image/generate

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
```

### 日志管理

```bash
# 查看实时日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f app
docker compose logs -f mysql
docker compose logs -f redis

# 查看最近100行日志
docker compose logs --tail=100 app
```

### 数据管理

```bash
# 备份数据库
docker compose exec -T mysql mysqldump -u root -p nano_banana \
  > data/mysql/backup_$(date +%Y%m%d).sql

# 备份上传文件
tar -czf data/uploads/backup_$(date +%Y%m%d).tar.gz data/uploads/

# 完整备份
tar -czf backup_$(date +%Y%m%d).tar.gz data/
```

### 进入容器

```bash
# 进入应用容器
docker compose exec app sh

# 进入 MySQL 容器
docker compose exec mysql bash

# 进入 Redis 容器
docker compose exec redis sh
```

### 清理操作

```bash
# 清理未使用资源
docker system prune -f

# 清理所有容器和数据（危险！）
docker compose down -v

# 重新构建镜像
docker compose build --no-cache
```

---

## 故障排除

### 端口被占用

```bash
# 检查端口占用
sudo netstat -tulpn | grep :3000

# 杀死进程
sudo kill -9 <PID>

# 或修改 .env 中的端口
APP_PORT=3001
```

### 数据库连接失败

```bash
# 检查 MySQL 状态
docker compose exec mysql mysqladmin ping

# 查看 MySQL 日志
docker compose logs mysql

# 检查环境变量
docker compose exec app env | grep DB_
```

### 应用启动失败

```bash
# 查看应用日志
docker compose logs app

# 检查环境变量
docker compose exec app env

# 重新构建镜像
docker compose build app --no-cache
```

### 内存不足

```bash
# 查看资源使用
docker stats

# 清理系统
docker system prune -a
```

### 更多问题

查看详细文档：
- 📖 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md#常见问题)
- 📖 [ENV_OPTIMIZATION.md](ENV_OPTIMIZATION.md)
- 📖 [DATA_BACKUP.md](DATA_BACKUP.md)

---

## 📚 文档导航

| 文档 | 说明 |
|------|------|
| [README.md](README.md) | 项目主文档 |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | 项目结构说明 |
| [ENV_OPTIMIZATION.md](ENV_OPTIMIZATION.md) | 环境变量优化说明 |
| [DATA_BACKUP.md](DATA_BACKUP.md) | 数据备份指南 |
| [COMPOSE_OPTIMIZATION.md](COMPOSE_OPTIMIZATION.md) | Docker Compose 优化总结 |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | 详细部署指南 |
| [docs/DOCKER_DEPLOYMENT.md](docs/DOCKER_DEPLOYMENT.md) | Docker 部署指南 |

---

## 🎉 部署成功！

恭喜！您已成功部署 Nano BananaAI。

**下一步**：
- 访问 http://localhost:3000
- 注册用户账号
- 配置 AI API Key
- 开始创作！

**管理**：
- 查看日志：`docker compose logs -f`
- 备份数据：`tar -czf backup.tar.gz data/`
- 重启服务：`docker compose restart`

---

**祝使用愉快！** 🎉
