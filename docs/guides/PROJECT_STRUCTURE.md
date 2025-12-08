# 📁 项目结构说明

本文档说明项目的目录结构和主要文件。

---

## 📦 根目录文件

```
/home/flint/project/Nano-Banana/
│
├── 🔧 应用核心文件
│   ├── server.js              # 应用主入口
│   ├── package.json           # Node.js 依赖配置
│   ├── database.sql           # 数据库初始化脚本
│   │
├── 🐳 Docker 部署文件
│   ├── Dockerfile             # 镜像构建配置
│   ├── docker-compose.yml     # 容器编排配置
│   ├── .dockerignore          # 构建忽略文件
│   ├── .env.example           # 环境变量示例
│   │
├── 📄 文档
│   ├── README.md              # 项目主文档
│   └── DATA_BACKUP.md         # 数据备份指南
│
└── 📁 目录
    ├── config/                # 应用配置
    ├── models/                # 数据模型
    ├── routes/                # API 路由
    ├── services/              # 业务服务
    ├── public/                # 静态文件
    ├── data/                  # 数据持久化（重要！）
    ├── docs/                  # 详细文档
    ├── scripts/               # 部署脚本
    ├── nginx/                 # Nginx 配置
    └── uploads/               # 上传文件目录
```

---

## 📁 核心目录说明

### 📂 data/ - 数据持久化目录

**重要**：所有持久化数据存储在此目录

```
data/
├── mysql/          # MySQL 数据库文件
│
├── redis/          # Redis 持久化文件
│
├── uploads/        # 用户上传的图片文件
│
├── logs/           # 应用日志文件
│   └── app/        # 应用运行日志
│
└── nginx/          # Nginx 日志文件
    ├── access.log  # 访问日志
    └── error.log   # 错误日志
```

**备份方法**：
```bash
# 完整备份 data 目录
tar -czf backup_$(date +%Y%m%d).tar.gz data/

# 或使用 MySQL 备份
docker compose exec mysql mysqldump -u root -p nano_banana > data/mysql/backup.sql
```

### 📂 docs/ - 详细文档

```
docs/
├── DEPLOYMENT.md              # 通用部署指南
├── DOCKER_DEPLOYMENT.md       # Docker 部署指南
├── README.docker.md           # Docker 快速开始
├── DOCKER_FILES_SUMMARY.md    # Docker 文件总结
├── FILE_STRUCTURE.md          # 文件结构详细说明
└── REFACTORING_SUMMARY.md     # 重构工作总结
```

### 📂 scripts/ - 部署和管理脚本

```
scripts/
├── deploy.sh                  # 自动部署脚本
├── verify-docker.sh           # Docker 配置验证
├── Makefile                   # 常用命令集合
├── start.sh                   # Linux 快速启动
└── start.bat                  # Windows 快速启动
```

**使用方法**：
```bash
# 使用部署脚本
./scripts/deploy.sh

# 使用 Makefile
cd scripts
make up      # 启动服务
make down    # 停止服务
make logs    # 查看日志
make backup  # 备份数据
```

### 📂 应用代码目录

```
├── config/
│   └── database.js            # 数据库连接配置
│
├── models/
│   ├── User.js                # 用户模型
│   ├── Image.js               # 图片模型
│   └── Announcement.js        # 公告模型
│
├── routes/
│   ├── auth.js                # 认证相关 API
│   ├── user.js                # 用户管理 API
│   ├── image.js               # 图片生成 API
│   └── admin.js               # 管理员 API
│
├── services/
│   ├── aiService.js           # AI 服务封装
│   └── mailService.js         # 邮件服务
│
└── public/
    ├── index.html             # 主页
    ├── login.html             # 登录页
    ├── main.js                # 前端脚本
    └── tutorial.html          # 使用教程
```

---

## 🚀 快速命令

### Docker Compose 管理

```bash
# 启动所有服务
docker compose up -d

# 停止所有服务
docker compose down

# 查看日志
docker compose logs -f

# 重启服务
docker compose restart

# 进入应用容器
docker compose exec app sh
```

### 数据备份

```bash
# 备份 MySQL
docker compose exec -T mysql mysqldump -u root -p nano_banana \
  > data/mysql/backup_$(date +%Y%m%d).sql

# 备份上传文件
tar -czf data/uploads/backup_$(date +%Y%m%d).tar.gz data/uploads/

# 完整备份
tar -czf backup_$(date +%Y%m%d).tar.gz data/
```

### 日志查看

```bash
# 查看应用日志
docker compose logs app

# 查看 MySQL 日志
docker compose logs mysql

# 查看 Nginx 日志
tail -f data/nginx/access.log

# 查看应用日志文件
tail -f data/logs/app/*.log
```

---

## ⚠️ 重要说明

### 数据安全

1. **data/ 目录包含所有重要数据**
   - 数据库文件
   - 用户上传的图片
   - 应用日志

2. **备份策略**
   - 定期备份 `data/` 目录
   - 重要更新前必须备份
   - 测试备份文件的可用性

3. **数据迁移**
   - 复制整个 `data/` 目录即可迁移所有数据
   - 确保目标机器权限设置正确

### 环境配置

1. **首次部署**
   ```bash
   cp .env.example .env
   # 编辑 .env，设置密码和 API 密钥
   ```

2. **生产环境安全**
   - 修改默认密码
   - 使用强 JWT 密钥
   - 配置防火墙
   - 启用 SSL/HTTPS

---

## 📚 更多文档

- `README.md` - 项目主文档
- `docs/DEPLOYMENT.md` - 详细部署指南
- `docs/DOCKER_DEPLOYMENT.md` - Docker 部署指南
- `DATA_BACKUP.md` - 数据备份与恢复

---

**快速导航**：
- 🚀 开始使用：`README.md`
- 📦 Docker 部署：`docs/DOCKER_DEPLOYMENT.md`
- 💾 数据备份：`DATA_BACKUP.md`
- 📖 所有文档：`docs/`
