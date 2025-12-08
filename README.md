
# 🍌 Nano BananaAI - AI 绘图创作平台

![Node.js](https://img.shields.io/badge/Node.js-16.0%2B-green) ![MySQL](https://img.shields.io/badge/MySQL-5.7%2B-blue) ![Express](https://img.shields.io/badge/Express-4.19-lightgrey) ![License](https://img.shields.io/badge/License-MIT-yellow)

**Nano BananaAI** 是一个轻量级、功能强大的 AI 绘图 Web 应用，支持文生图、图生图及图片二次编辑功能，并配备完整的用户系统和超级管理员后台。

> 💡 **项目特色**: 核心代码由 AI 辅助生成，适合学习和快速部署，非常适合新手学习 Node.js 全栈开发。

---

## ✨ 功能特性

### 🎨 AI 绘图功能
- **文本生成图片 (Text-to-Image)** - 根据文本描述生成高质量图像
- **图片生成图片 (Image-to-Image)** - 基于参考图片进行编辑和再创作
- **多模型支持** - 支持 GPT-4o-Image 和 Nano Banana Pro 模型
- **高清输出** - 支持 2K 及 4K 高分辨率图片生成
- **自定义参数** - 支持尺寸、质量、风格、画面比例等参数调节
- **批量生成** - 一次性生成 1-4 张图片

### 👤 用户系统
- **邮箱注册登录** - 支持邮箱验证码注册和密码登录
- **积分系统** - 每日签到获取积分，积分用于绘图消费
- **自定义 API Key** - 用户可配置自己的 OpenAI 兼容 API Key
- **作品管理** - 查看和管理个人创作历史
- **灵感广场** - 浏览平台公开的优秀作品

### 🛡️ 管理员后台
- **用户管理** - 查看、编辑、禁用用户账号
- **积分管理** - 调整用户积分和权限
- **作品管理** - 查看全局绘图记录
- **公告系统** - 发布和管理系统公告
- **数据统计** - 查看平台使用统计数据

### 🔧 技术特性
- **响应式设计** - 完美适配桌面端和移动端
- **暗色主题** - 现代化的 UI 设计
- **安全认证** - JWT Token + bcrypt 密码加密
- **速率限制** - 防止 API 滥用
- **错误处理** - 完善的错误处理和日志记录
- **邮件通知** - 支持邮箱验证码发送

---

## 🛠️ 技术栈

### 后端
- **Node.js** (v16.0+) - JavaScript 运行时
- **Express** (v4.19) - Web 框架
- **MySQL** (v5.7+) - 关系型数据库
- **JWT** - 用户认证
- **bcryptjs** - 密码加密
- **nodemailer** - 邮件发送

### 前端
- **原生 JavaScript** - 无框架依赖
- **Tailwind CSS** - 样式框架
- **Font Awesome** - 图标库

---

## 🚀 快速开始

### 方式一：Docker Compose 部署（推荐⭐）

```bash
# 1. 克隆项目
git clone https://github.com/flintttan/Nano-Banana.git
cd Nano-Banana

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置密码和 API 密钥

# 3. 启动服务
docker compose up -d

# 4. 访问应用
# http://localhost:3000
```

**管理命令**：
```bash
# 查看日志
docker compose logs -f

# 停止服务
docker compose down

# 重启服务
docker compose restart
```

**数据位置**：所有数据存储在 `data/` 目录中
- `data/mysql/` - MySQL 数据库
- `data/redis/` - Redis 缓存
- `data/uploads/` - 用户上传文件
- `data/logs/` - 应用日志

### 方式二：使用自动部署脚本

```bash
# 克隆项目
git clone https://github.com/flintttan/Nano-Banana.git
cd Nano-Banana

# 运行自动部署脚本
./scripts/deploy.sh

# 按照提示完成配置
```

### 方式三：使用 Makefile

```bash
# 查看可用命令
cd scripts
make help

# 启动服务
make up

# 查看日志
make logs
```

---

## 📁 项目结构

```
/home/flint/project/Nano-Banana/
├── 🔧 核心文件
│   ├── server.js              # 应用主入口
│   ├── package.json           # 依赖配置
│   ├── database.sql           # 数据库初始化
│   │
├── 🐳 Docker 部署
│   ├── Dockerfile             # 镜像构建
│   ├── docker-compose.yml     # 容器编排
│   ├── .env.example           # 环境变量示例
│   │
├── 📄 文档
│   ├── README.md              # 项目主文档
│   └── docs/                  # 详细文档
│       ├── guides/            # 指南文档
│       │   ├── QUICK_START.md     # 快速开始
│       │   ├── PROJECT_STRUCTURE.md # 结构说明
│       │   ├── DATA_BACKUP.md     # 数据备份指南
│       │   ├── ENV_OPTIMIZATION.md # 环境变量优化
│       │   ├── COMPOSE_OPTIMIZATION.md # 优化总结
│       │   └── OPTIMIZATION_SUMMARY.md # 重构总结
│       ├── DEPLOYMENT.md          # 通用部署指南
│       ├── DOCKER_DEPLOYMENT.md   # Docker 部署指南
│       └── README.docker.md       # Docker 快速开始
│
└── 📁 目录
    ├── config/                # 应用配置
    ├── models/                # 数据模型
    ├── routes/                # API 路由
    ├── services/              # 业务服务
    ├── public/                # 静态文件
    ├── data/                  # 数据持久化（重要！）
    ├── scripts/               # 部署脚本
    └── nginx/                 # Nginx 配置
```

详细说明请查看：[docs/guides/PROJECT_STRUCTURE.md](./docs/guides/PROJECT_STRUCTURE.md)

---

## 📚 文档导航

| 文档 | 说明 |
|------|------|
| [docs/guides/QUICK_START.md](./docs/guides/QUICK_START.md) | 快速开始指南 |
| [docs/guides/PROJECT_STRUCTURE.md](./docs/guides/PROJECT_STRUCTURE.md) | 项目结构详细说明 |
| [docs/guides/DATA_BACKUP.md](./docs/guides/DATA_BACKUP.md) | 数据备份与恢复指南 |
| [docs/guides/ENV_OPTIMIZATION.md](./docs/guides/ENV_OPTIMIZATION.md) | 环境变量优化说明 |
| [docs/guides/COMPOSE_OPTIMIZATION.md](./docs/guides/COMPOSE_OPTIMIZATION.md) | Docker Compose 优化总结 |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | 通用部署指南 |
| [docs/DOCKER_DEPLOYMENT.md](./docs/DOCKER_DEPLOYMENT.md) | Docker 部署指南 |
| [docs/README.docker.md](./docs/README.docker.md) | Docker 快速开始 |

---

## 🔧 常用命令

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

### 使用脚本

```bash
# 自动部署
./scripts/deploy.sh

# 验证配置
./scripts/verify-docker.sh

# 使用 Makefile
cd scripts
make up      # 启动服务
make down    # 停止服务
make logs    # 查看日志
make backup  # 备份数据
```

---

## 🔑 配置说明

### 环境变量 (.env)

关键配置项：
```env
# 数据库配置
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_PASSWORD=your_db_password
MYSQL_DATABASE=nano_banana

# JWT 密钥（请务必修改）
JWT_SECRET=your_super_secret_jwt_key

# AI API 配置（必须配置）
AI_API_KEY=sk-your-api-key

# 邮箱配置（可选）
MAIL_USER=your_email@qq.com
MAIL_PASS=your_email_auth_code
```

---

## ⚠️ 重要说明

### 数据安全

- **所有数据存储在 `data/` 目录**
- 定期备份 `data/` 目录
- 重要更新前必须备份
- 数据迁移：复制整个 `data/` 目录

### 首次部署

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env，设置密码和 API 密钥

# 2. 启动服务
docker compose up -d

# 3. 等待服务启动（约 1-2 分钟）
# 首次启动会自动初始化数据库

# 4. 访问应用
# http://localhost:3000
```

---

## 🆘 故障排除

### 端口被占用
```bash
# 查看端口占用
sudo netstat -tulpn | grep :3000

# 或修改 .env 中的端口
APP_PORT=3001
```

### 数据库连接失败
```bash
# 检查 MySQL 状态
docker compose exec mysql mysqladmin ping

# 查看 MySQL 日志
docker compose logs mysql
```

### 查看详细错误
```bash
# 查看应用日志
docker compose logs app

# 查看所有服务日志
docker compose logs
```

更多问题请查看：[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md#常见问题)

---

## 📈 更新日志

### v2.0.0 (2025-12-09)
- ✅ 优化 Docker Compose 配置，移除 version 字段
- ✅ 简化数据持久化，所有数据集中到 `data/` 目录
- ✅ 优化目录结构，根目录保持整洁
- ✅ 文档集中到 `docs/` 目录
- ✅ 脚本文件集中到 `scripts/` 目录
- ✅ 更新 README，添加 Docker Compose 快速开始

---

## 📞 获取帮助

- 📖 查看文档：[docs/](./docs/)
- 💾 数据备份：[docs/guides/DATA_BACKUP.md](./docs/guides/DATA_BACKUP.md)
- 📁 项目结构：[docs/guides/PROJECT_STRUCTURE.md](./docs/guides/PROJECT_STRUCTURE.md)
- 🚀 快速开始：[docs/guides/QUICK_START.md](./docs/guides/QUICK_START.md)
- 🐛 提交 Issue：https://github.com/flintttan/Nano-Banana/issues

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

**祝使用愉快！** 🎉
