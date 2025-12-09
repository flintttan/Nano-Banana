# 🐳 Docker 快速启动指南

## 🚀 一键启动

```bash
# 1. 配置环境变量（首次运行）
cp .env.example .env
nano .env  # 修改必要的配置

# 2. 运行启动脚本
./docker-start.sh
```

## ⚙️ 启动步骤详解

### 步骤 1：配置环境变量

复制并编辑环境变量文件：

```bash
cp .env.example .env
```

**必须修改的配置项：**

```env
# JWT 密钥（请修改为随机字符串）
JWT_SECRET=your_jwt_secret_key_change_this_to_a_long_random_string

# AI API 配置（请修改为你的实际 API）
AI_API_BASE_URL=https://api-host
AI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 步骤 2：启动服务

```bash
# 方法一：使用启动脚本（推荐）
chmod +x docker-start.sh
./docker-start.sh

# 方法二：手动启动
docker-compose up -d
```

### 步骤 3：访问服务

打开浏览器访问：http://localhost:3000

## 📋 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f app

# 停止服务
docker-compose down

# 重启服务
docker-compose restart app

# 查看资源使用
docker stats
```

## 🔧 服务说明

| 服务 | 端口 | 描述 |
|------|------|------|
| 应用服务 | 3000 | Node.js 主应用 |
| MySQL | 3306 | 数据库 |
| Redis | 6379 | 缓存 |

## ❗ 注意事项

- 首次启动会创建数据库，请耐心等待
- 配置文件 `.env` 必须配置 AI API 密钥才能正常绘图
- 数据存储在 `data/` 目录，请定期备份

## 📚 详细文档

完整文档请查看：[DOCKER_GUIDE.md](DOCKER_GUIDE.md)
