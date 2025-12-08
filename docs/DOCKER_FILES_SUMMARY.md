# Docker Compose 部署文件总结

本文档总结了在项目中新增的 Docker Compose 部署相关文件。

---

## 📁 新增文件列表

### 核心配置文件

1. **docker-compose.yml**
   - 完整的 Docker Compose 配置
   - 包含应用、MySQL、Redis、Nginx 服务
   - 支持数据持久化、健康检查
   - 支持生产环境 profile

2. **Dockerfile**
   - 基于 Node.js 16 Alpine
   - 优化镜像大小
   - 非 root 用户运行
   - 内置健康检查

3. **.dockerignore**
   - 优化 Docker 构建上下文
   - 排除不必要文件
   - 提升构建速度

### 环境配置

4. **.env.example** (已更新)
   - 新增 Docker 相关环境变量
   - MySQL、Redis 配置
   - 详细的配置说明

### Nginx 配置

5. **nginx/nginx.conf**
   - 生产级 Nginx 配置
   - 负载均衡、缓存
   - SSL/HTTPS 支持
   - Gzip 压缩

### 文档文件

6. **DOCKER_DEPLOYMENT.md**
   - 详细的 Docker Compose 部署指南
   - 包含前置要求、配置说明、管理命令
   - 故障排除、性能优化、生产环境部署

7. **README.docker.md**
   - 快速开始指南
   - 常用命令参考
   - 简化版文档

### 脚本文件

8. **deploy.sh** (可执行)
   - 自动部署脚本
   - 交互式配置
   - 支持开发/生产模式
   - 自动验证部署

9. **verify-docker.sh** (可执行)
   - Docker 配置验证脚本
   - 检查依赖、端口、环境变量
   - 生成验证报告

10. **Makefile**
    - 常用操作命令集合
    - 启动、停止、日志、备份
    - 简化日常维护

---

## 🚀 快速开始

### 方式一：使用自动部署脚本

```bash
cd OpenSource_Banana
./deploy.sh
```

### 方式二：使用 Makefile

```bash
cd OpenSource_Banana
make setup    # 初始化 .env 文件
make up       # 启动服务
make status   # 查看状态
```

### 方式三：手动部署

```bash
cd OpenSource_Banana
cp .env.example .env
# 编辑 .env 文件
docker compose up -d
```

---

## 📊 服务架构

```
┌─────────────────────────────────────────┐
│              Nginx (可选)                │
│            端口: 80/443                  │
└───────────────┬─────────────────────────┘
                │
┌───────────────┴─────────────────────────┐
│         Node.js 应用                     │
│         端口: 3000                      │
│    - Express 服务器                      │
│    - API 路由                           │
│    - 静态文件服务                       │
└───────────────┬─────────────────────────┘
                │
    ┌───────────┴───────────┐
    │                       │
┌───▼────┐          ┌────▼────┐
│ MySQL  │          │  Redis  │
│ 3306   │          │  6379   │
│ 数据   │          │  缓存   │
└────────┘          └─────────┘
```

---

## 🎯 主要特性

### ✅ 完整功能

- **多服务编排**: 应用、数据库、缓存、反向代理
- **本地镜像构建**: 基于 Dockerfile 本地构建
- **数据持久化**: MySQL、Redis、上传文件
- **健康检查**: 自动监控服务状态
- **环境隔离**: 使用环境变量配置
- **网络隔离**: 独立的 Docker 网络

### ✅ 生产就绪

- **资源限制**: CPU、内存限制
- **日志管理**: 结构化日志、日志轮转
- **安全配置**: 非 root 用户、最小权限
- **备份方案**: 自动化备份脚本
- **监控**: 健康检查、资源监控

### ✅ 开发友好

- **快速启动**: 一键部署脚本
- **热重载**: 开发模式支持
- **调试工具**: 进入容器、查看日志
- **多环境**: 开发/生产 profile

---

## 📚 文档结构

```
OpenSource_Banana/
├── docker-compose.yml          # 主配置文件
├── Dockerfile                   # 应用镜像
├── .dockerignore                # 构建忽略
├── .env.example                 # 环境变量示例
├── deploy.sh                    # 自动部署脚本
├── verify-docker.sh             # 配置验证脚本
├── Makefile                     # 常用命令
├── nginx/
│   └── nginx.conf              # Nginx 配置
├── uploads/                     # 上传文件目录
│   └── .gitkeep
├── DOCKER_DEPLOYMENT.md         # 详细部署文档
├── README.docker.md             # 快速开始指南
└── DOCKER_FILES_SUMMARY.md      # 本文件
```

---

## 🔧 常用命令速查

| 操作 | 命令 |
|------|------|
| 启动服务 | `docker compose up -d` |
| 启动生产环境 | `docker compose --profile production up -d` |
| 查看日志 | `docker compose logs -f` |
| 查看状态 | `docker compose ps` |
| 停止服务 | `docker compose down` |
| 重启服务 | `docker compose restart` |
| 进入容器 | `docker compose exec app sh` |
| 备份数据 | `make backup` |
| 验证配置 | `./verify-docker.sh` |
| 清理所有 | `make clean` |

---

## 💡 使用建议

### 开发环境

```bash
# 快速启动
./deploy.sh

# 或使用 Makefile
make setup
make up
make logs
```

### 生产环境

```bash
# 配置环境变量
cp .env.example .env
# 编辑 .env，设置强密码和真实 API 密钥

# 启动生产环境（包含 Nginx）
docker compose --profile production up -d

# 设置监控和备份
make backup
make health
```

### 维护操作

```bash
# 更新服务
make update

# 查看资源使用
make status

# 清理日志
make clean-logs

# 定期备份
crontab -e
# 0 2 * * * cd /path/to/OpenSource_Banana && make backup
```

---

## 📞 获取帮助

- **完整文档**: [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
- **快速指南**: [README.docker.md](./README.docker.md)
- **常见问题**: [DEPLOYMENT.md](./DEPLOYMENT.md#常见问题)
- **项目 Issues**: https://github.com/pili1121/Nano-Banana/issues

---

**祝使用愉快！** 🎉
