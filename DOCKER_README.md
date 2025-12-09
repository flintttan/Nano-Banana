# 🐳 Docker 部署完整指南

## 📦 包含的文件

- `docker-compose.yml` - Docker Compose 编排文件
- `Dockerfile` - 应用容器构建文件
- `.dockerignore` - Docker 构建忽略文件
- `docker-start.sh` - 一键启动脚本
- `docker-check.sh` - 环境检查脚本
- `DOCKER_GUIDE.md` - 详细部署文档
- `README_DOCKER.md` - 快速启动指南

## 🚀 快速开始

### 1️⃣ 检查环境（可选）

```bash
./docker-check.sh
```

### 2️⃣ 配置环境变量

```bash
cp .env.example .env
nano .env
```

**必须修改：**
- `JWT_SECRET` - JWT 密钥（随机字符串）
- `AI_API_KEY` - AI API 密钥
- `AI_API_BASE_URL` - AI API 地址

### 3️⃣ 启动服务

```bash
./docker-start.sh
```

或者手动：

```bash
docker-compose up -d
```

### 4️⃣ 访问应用

浏览器打开：http://localhost:3000

## 🔧 常用命令

```bash
# 启动
docker-compose up -d

# 停止
docker-compose down

# 查看日志
docker-compose logs -f app

# 查看状态
docker-compose ps

# 重启
docker-compose restart

# 强制重建
docker-compose build --no-cache
docker-compose up -d
```

## 🗄️ 服务架构

| 容器名 | 端口 | 描述 |
|--------|------|------|
| nano-banana-app | 3000 | Node.js 应用 |
| nano-banana-mysql | 3306 | MySQL 8.0 |
| nano-banana-redis | 6379 | Redis |
| nano-banana-nginx | 80/443 | Nginx（可选） |

## 📁 数据目录

```
data/
├── mysql/      # 数据库文件
├── redis/      # 缓存数据
├── uploads/    # 上传图片
└── logs/       # 日志文件
```

## ⚠️ 注意事项

1. **首次启动**会初始化数据库，请耐心等待
2. **AI API 密钥**必须配置才能绘图
3. **数据持久化**在 data/ 目录，请定期备份
4. **停止服务**使用 `docker-compose down`，不要直接 kill 容器

## 📚 更多文档

- 📖 详细文档：[DOCKER_GUIDE.md](DOCKER_GUIDE.md)
- ⚡ 快速指南：[README_DOCKER.md](README_DOCKER.md)
- 🛠️ 运维指南：`docs/guides/ENV_OPTIMIZATION.md`

## ❓ 故障排除

**服务无法启动？**
```bash
# 查看日志
docker-compose logs app

# 检查环境变量
docker-compose exec app env
```

**数据库连接失败？**
```bash
# 等待 MySQL 启动（可能需要 30-60 秒）
docker-compose logs mysql

# 测试连接
docker-compose exec mysql mysql -u nano_user -p nano_banana
```

**端口被占用？**
```bash
# 修改 .env 文件中的端口
APP_PORT=3001
MYSQL_PORT=3307
REDIS_PORT=6380
```

## 🔄 更新应用

```bash
# 拉取最新代码
git pull

# 重新构建
docker-compose build app
docker-compose up -d app

# 查看更新
docker-compose logs -f app
```

---

**🎉 享受使用 Nano Banana！**
