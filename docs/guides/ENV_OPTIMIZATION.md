# 🔧 Docker Compose 环境变量优化

本文档说明了对 `docker-compose.yml` 中环境变量配置的优化。

---

## 🎯 优化目标

1. ✅ 移除默认值（`:-default`），强制使用真实配置
2. ✅ 统一变量命名规范
3. ✅ 减少重复配置
4. ✅ 提高可读性和可维护性

---

## 📊 优化前后对比

### 优化前

```yaml
app:
  environment:
    # 数据库配置
    DB_NAME: ${MYSQL_DATABASE:-nano_banana}
    DB_USER: ${MYSQL_USER:-nano_user}
    DB_PASSWORD: ${MYSQL_PASSWORD:-nano_password_123}

    # JWT 配置
    JWT_SECRET: ${JWT_SECRET:-your_super_secret_jwt_key_change_this_in_production}

    # AI API 配置
    AI_API_BASE_URL: ${AI_API_BASE_URL:-https://api.fengjungpt.com}
    AI_API_KEY: ${AI_API_KEY:-your_api_key_here}
```

**问题**：
- ❌ 使用默认值可能导致安全问题
- ❌ 变量名不一致（MYSQL_ vs DB_）
- ❌ 变量定义位置分散
- ❌ 注释过多占用空间

### 优化后

```yaml
app:
  environment:
    NODE_ENV: ${NODE_ENV}
    PORT: 3000

    DB_HOST: mysql
    DB_NAME: ${MYSQL_DATABASE}
    DB_USER: ${MYSQL_USER}
    DB_PASSWORD: ${MYSQL_PASSWORD}
    DB_PORT: ${MYSQL_PORT}

    REDIS_HOST: redis
    REDIS_PORT: ${REDIS_PORT}

    JWT_SECRET: ${JWT_SECRET}
    AI_API_BASE_URL: ${AI_API_BASE_URL}
    AI_API_KEY: ${AI_API_KEY}

    MAIL_HOST: ${MAIL_HOST}
    MAIL_PORT: ${MAIL_PORT}
    MAIL_USER: ${MAIL_USER}
    MAIL_PASS: ${MAIL_PASS}
    MAIL_FROM: ${MAIL_FROM}

    FRONTEND_URL: ${FRONTEND_URL}
```

**改进**：
- ✅ 强制用户提供真实值
- ✅ 变量名统一（MySQL 服务用 MYSQL_ 前缀，应用用 DB_ 前缀）
- ✅ 按功能分组，逻辑清晰
- ✅ 移除不必要注释

---

## 📝 使用说明

### 1. 创建 .env 文件

```bash
# 复制示例文件
cp .env.example .env
```

### 2. 编辑 .env 文件

**重要**：必须设置所有必需的环境变量

```env
# .env 文件示例

# 应用配置
NODE_ENV=production
APP_PORT=3000

# MySQL 配置
MYSQL_ROOT_PASSWORD=your_strong_root_password
MYSQL_DATABASE=nano_banana
MYSQL_USER=nano_user
MYSQL_PASSWORD=your_strong_db_password
MYSQL_PORT=3306

# Redis 配置
REDIS_PORT=6379

# JWT 配置（请务必修改）
JWT_SECRET=$(openssl rand -base64 32)

# AI API 配置（必须配置）
AI_API_BASE_URL=https://api.fengjungpt.com
AI_API_KEY=sk-your-actual-api-key

# 邮箱配置（可选）
MAIL_HOST=smtp.qq.com
MAIL_PORT=465
MAIL_USER=your_email@example.com
MAIL_PASS=your_auth_code
MAIL_FROM=Nano Banana <noreply@nanobanana.ai>

# CORS 配置
FRONTEND_URL=*

# Nginx 配置（可选）
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443
```

### 3. 启动服务

```bash
# 验证配置
./scripts/verify-docker.sh

# 启动服务
docker compose up -d
```

---

## 🔐 安全建议

### 1. 必须修改的默认值

- [ ] `MYSQL_ROOT_PASSWORD` - 设置强密码
- [ ] `MYSQL_PASSWORD` - 设置强密码
- [ ] `JWT_SECRET` - 使用 `openssl rand -base64 32` 生成
- [ ] `AI_API_KEY` - 使用真实的 API 密钥
- [ ] `MAIL_PASS` - 使用邮箱授权码

### 2. 生成随机密码

```bash
# 生成 JWT 密钥
openssl rand -base64 32

# 生成 MySQL 密码
openssl rand -base64 24

# 或使用以下命令组合
echo "MYSQL_ROOT_PASSWORD=$(openssl rand -base64 24)" >> .env
echo "MYSQL_PASSWORD=$(openssl rand -base64 24)" >> .env
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
```

### 3. .gitignore

确保 `.env` 文件不被提交到版本控制：

```bash
# .gitignore 中已有
.env
```

---

## 📋 变量清单

### 应用配置

| 变量名 | 说明 | 示例值 | 是否必需 |
|--------|------|--------|----------|
| `NODE_ENV` | 运行环境 | `production` | ✅ |
| `APP_PORT` | 应用端口 | `3000` | ❌ |

### MySQL 配置

| 变量名 | 说明 | 示例值 | 是否必需 |
|--------|------|--------|----------|
| `MYSQL_ROOT_PASSWORD` | MySQL root 密码 | `StrongP@ssw0rd123` | ✅ |
| `MYSQL_DATABASE` | 数据库名 | `nano_banana` | ✅ |
| `MYSQL_USER` | 数据库用户 | `nano_user` | ✅ |
| `MYSQL_PASSWORD` | 数据库密码 | `NanoP@ssw0rd456` | ✅ |
| `MYSQL_PORT` | MySQL 端口 | `3306` | ❌ |

### Redis 配置

| 变量名 | 说明 | 示例值 | 是否必需 |
|--------|------|--------|----------|
| `REDIS_PORT` | Redis 端口 | `6379` | ❌ |

### JWT 配置

| 变量名 | 说明 | 示例值 | 是否必需 |
|--------|------|--------|----------|
| `JWT_SECRET` | JWT 签名密钥 | `随机字符串` | ✅ |

### AI API 配置

| 变量名 | 说明 | 示例值 | 是否必需 |
|--------|------|--------|----------|
| `AI_API_BASE_URL` | AI API 基础 URL | `https://api.fengjungpt.com` | ❌ |
| `AI_API_KEY` | AI API 密钥 | `sk-xxxxxxxx` | ✅ |

### 邮箱配置

| 变量名 | 说明 | 示例值 | 是否必需 |
|--------|------|--------|----------|
| `MAIL_HOST` | SMTP 服务器 | `smtp.qq.com` | ❌ |
| `MAIL_PORT` | SMTP 端口 | `465` | ❌ |
| `MAIL_USER` | 发件邮箱 | `your_email@qq.com` | ❌ |
| `MAIL_PASS` | 邮箱授权码 | `your_auth_code` | ❌ |
| `MAIL_FROM` | 发件人显示 | `Nano Banana <noreply@...>` | ❌ |

### CORS 配置

| 变量名 | 说明 | 示例值 | 是否必需 |
|--------|------|--------|----------|
| `FRONTEND_URL` | 前端访问地址 | `*` | ❌ |

### Nginx 配置

| 变量名 | 说明 | 示例值 | 是否必需 |
|--------|------|--------|----------|
| `NGINX_HTTP_PORT` | HTTP 端口 | `80` | ❌ |
| `NGINX_HTTPS_PORT` | HTTPS 端口 | `443` | ❌ |

---

## 🚀 进阶优化

### 1. 多环境配置

创建 `docker-compose.override.yml`（开发环境）：
```yaml
services:
  app:
    environment:
      NODE_ENV: development
      DEBUG: true
```

创建 `docker-compose.prod.yml`（生产环境）：
```yaml
services:
  app:
    environment:
      NODE_ENV: production
      DEBUG: false
```

使用方式：
```bash
# 开发环境
docker compose up -d

# 生产环境
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 2. 环境变量文件分离

创建 `env/mysql.env`：
```bash
MYSQL_ROOT_PASSWORD=your_password
MYSQL_DATABASE=nano_banana
MYSQL_USER=nano_user
MYSQL_PASSWORD=your_password
```

在 `docker-compose.yml` 中引用：
```yaml
mysql:
  environment:
    env_file:
      - env/mysql.env
```

### 3. 使用 YAML 锚点

```yaml
x-common-env: &common-env
  JWT_SECRET: ${JWT_SECRET}
  AI_API_BASE_URL: ${AI_API_BASE_URL}
  AI_API_KEY: ${AI_API_KEY}
  # ... 其他公共变量

services:
  app:
    environment:
      <<: *common_env
      NODE_ENV: production
```

---

## ✅ 验证配置

### 方法一：使用验证脚本

```bash
./scripts/verify-docker.sh
```

### 方法二：手动检查

```bash
# 检查环境变量
docker compose config

# 验证语法
docker compose config --quiet
```

### 方法三：启动测试

```bash
# 启动服务
docker compose up -d

# 查看日志
docker compose logs app

# 检查环境变量
docker compose exec app env | grep -E "DB_|JWT_|AI_"
```

---

## ⚠️ 注意事项

1. **必须创建 .env 文件**
   - 不创建 `.env` 文件服务无法启动
   - 所有必需变量必须设置

2. **安全性**
   - 不要在代码中硬编码敏感信息
   - 使用强密码和随机字符串
   - 将 `.env` 加入 `.gitignore`

3. **变量命名**
   - 保持一致性
   - MySQL 相关使用 `MYSQL_` 前缀
   - 应用数据库配置使用 `DB_` 前缀

4. **默认值**
   - 已移除所有默认值
   - 强制用户显式配置

---

## 📚 相关文档

- `README.md` - 项目主文档
- `.env.example` - 环境变量示例
- `scripts/deploy.sh` - 自动部署脚本

---

**优化完成时间**：2025-12-09
**优化内容**：环境变量配置简化
**主要收益**：更安全、更清晰、更易维护

---

**🎉 环境变量配置现已优化！**
