# 🐳 Docker Compose 快速开始

欢迎使用 Nano Banana AI 绘图网站！本指南将帮助您使用 Docker Compose 快速部署应用。

---

## 📦 包含服务

- **Node.js 应用**: 主应用服务（端口 3000）
- **MySQL 5.7**: 数据库服务（端口 3306）
- **Redis 6**: 缓存服务（端口 6379）
- **Nginx**: 反向代理（端口 80/443，可选）

---

## 🚀 快速部署

### 方式一：使用自动部署脚本（推荐）

```bash
# 克隆项目
git clone https://github.com/pili1121/Nano-Banana.git
cd Nano-Banana/OpenSource_Banana

# 运行部署脚本
./deploy.sh

# 按照提示完成配置
```

**脚本功能**：
- ✅ 自动检查依赖（Docker、Docker Compose）
- ✅ 自动配置环境变量
- ✅ 自动拉取镜像和构建应用
- ✅ 自动启动所有服务
- ✅ 自动验证部署结果

### 方式二：手动部署

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置密码和 API 密钥

# 2. 启动服务
docker compose up -d

# 3. 查看日志
docker compose logs -f
```

---

## 📝 配置说明

### 必需配置

编辑 `.env` 文件，设置以下选项：

```env
# 数据库密码（请务必修改）
MYSQL_ROOT_PASSWORD=your_strong_root_password
MYSQL_PASSWORD=your_strong_db_password

# JWT 密钥（请务必修改）
JWT_SECRET=$(openssl rand -base64 32)

# AI API 密钥（必须配置）
AI_API_KEY=sk-your-actual-api-key
```

### 可选配置

```env
# 邮箱配置（用于发送验证码）
MAIL_USER=your_email@qq.com
MAIL_PASS=your_email_auth_code

# 端口配置
APP_PORT=3000        # 应用端口
MYSQL_PORT=3306      # MySQL 端口
REDIS_PORT=6379      # Redis 端口
```

---

## 🔧 常用命令

### 服务管理

```bash
# 启动所有服务
docker compose up -d

# 启动生产环境（包含 Nginx）
docker compose --profile production up -d

# 停止所有服务
docker compose down

# 重启服务
docker compose restart

# 查看状态
docker compose ps
```

### 日志管理

```bash
# 查看所有服务日志
docker compose logs

# 实时查看应用日志
docker compose logs -f app

# 查看最近 100 行日志
docker compose logs --tail=100 app

# 查看特定服务日志
docker compose logs mysql
docker compose logs redis
```

### 数据库操作

```bash
# 备份数据库
docker compose exec mysql mysqldump -u root -p nano_banana > backup.sql

# 恢复数据库
cat backup.sql | docker compose exec -T mysql mysql -u root -p nano_banana

# 连接 MySQL
docker compose exec mysql mysql -u root -p nano_banana
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
# 停止并删除所有容器
docker compose down -v

# 删除所有数据卷（危险！）
docker compose down -v --remove-orphans

# 删除未使用的镜像
docker image prune -a

# 完全清理（谨慎使用）
docker system prune -a --volumes
```

---

## 📊 数据持久化

### 数据卷位置

- **MySQL 数据**: `nano-banana-mysql-data`
- **Redis 数据**: `nano-banana-redis-data`
- **上传文件**: `nano-banana-uploads`
- **Nginx 日志**: `nano-banana-nginx-logs`

### 备份数据

```bash
# 备份 MySQL 数据
docker run --rm --volumes-from nano-banana-mysql \
  -v $(pwd):/backup \
  mysql:5.7 \
  sh -c "mysqldump -u root -p nano_banana > /backup/backup_$(date +%Y%m%d_%H%M%S).sql"

# 备份上传文件
docker run --rm --volumes-from nano-banana-app \
  -v $(pwd):/backup \
  alpine \
  tar czf /backup/uploads_$(date +%Y%m%d_%H%M%S).tar.gz /app/uploads
```

---

## 🌍 访问应用

部署成功后，访问以下地址：

- **应用主页**: http://localhost:3000
- **健康检查**: http://localhost:3000/api/health
- **API 文档**: http://localhost:3000/api

---

## 🆘 故障排除

### 端口被占用

```bash
# 查看端口占用
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

# 重启 MySQL
docker compose restart mysql
```

### 容器启动失败

```bash
# 查看容器日志
docker compose logs app

# 检查配置文件
docker compose exec app cat /app/.env

# 重新构建镜像
docker compose build --no-cache
```

### 内存不足

```bash
# 查看资源使用
docker stats

# 清理未使用资源
docker system prune -a
```

---

## 📚 更多信息

- **完整部署文档**: [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
- **通用部署指南**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **项目主页**: https://github.com/pili1121/Nano-Banana

---

## 🆘 获取帮助

如果您遇到问题：

1. 查看 [故障排除](#故障排除) 章节
2. 查看应用日志：`docker compose logs app`
3. 提交 Issue：https://github.com/pili1121/Nano-Banana/issues

---

**祝部署顺利！** 🎉
