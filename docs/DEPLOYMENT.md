# 🚀 Nano BananaAI 部署指南

本文档提供详细的部署说明，涵盖开发环境和生产环境的部署方案。

---

## 📋 目录
1. [系统要求](#系统要求)
2. [开发环境部署](#开发环境部署)
3. [生产环境部署](#生产环境部署)
4. [宝塔面板部署](#宝塔面板部署)
5. [Docker 部署](#docker-部署)
6. [常见问题](#常见问题)

---

## 系统要求

### 硬件要求
- **CPU**: 1 核心及以上
- **内存**: 512MB 及以上（推荐 1GB+）
- **磁盘**: 1GB 可用空间（用于上传图片）

### 软件要求
- **Node.js**: >= 16.0.0
- **MySQL**: >= 5.7
- **npm**: >= 7.0 或 pnpm >= 6.0
- **操作系统**: Linux / macOS / Windows

### 网络要求
- 能够访问 AI API 服务（默认：https://api.fengjungpt.com）
- 如需邮箱验证功能，需能连接到 SMTP 服务器

---

## 开发环境部署

### 1. 克隆项目
```bash
git clone https://github.com/pili1121/Nano-Banana.git
cd Nano-Banana
```

### 2. 安装依赖
```bash
# 使用 npm
npm install

# 或使用 pnpm (推荐，更快)
pnpm install
```

### 3. 配置环境变量
```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑环境变量
nano .env  # 或使用其他编辑器
```

**.env 配置示例**:
```env
# 服务器配置
NODE_ENV=development
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nano_banana

# JWT 密钥 (务必修改)
JWT_SECRET=your_super_secret_jwt_key_change_this

# AI API 配置
AI_API_BASE_URL=https://api.fengjungpt.com
AI_API_KEY=sk-your-api-key

# 邮箱配置 (QQ 邮箱示例)
MAIL_HOST=smtp.qq.com
MAIL_PORT=465
MAIL_USER=your_email@qq.com
MAIL_PASS=your_auth_code

# CORS 配置
FRONTEND_URL=*
```

### 4. 初始化数据库
```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE nano_banana CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 退出 MySQL
exit;

# 导入数据库结构
mysql -u root -p nano_banana < database.sql
```

### 5. 启动开发服务器
```bash
# 直接启动
npm start

# 或使用 nodemon (自动重启)
npm install -g nodemon
nodemon server.js
```

### 6. 验证部署
访问 http://localhost:3000，应该能看到登录页面。

---

## 生产环境部署

### 方案一：使用 PM2（推荐）

#### 1. 安装 PM2
```bash
npm install -g pm2
```

#### 2. 配置 PM2 启动文件
创建 `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'nano-banana',
    script: './server.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    max_memory_restart: '500M',
    autorestart: true,
    watch: false
  }]
};
```

#### 3. 启动应用
```bash
# 启动应用
pm2 start ecosystem.config.js

# 查看运行状态
pm2 status

# 查看日志
pm2 logs nano-banana

# 重启应用
pm2 restart nano-banana

# 停止应用
pm2 stop nano-banana

# 删除应用
pm2 delete nano-banana

# 设置开机自启
pm2 startup
pm2 save
```

### 方案二：使用 Nginx 反向代理

#### 1. 安装 Nginx
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

#### 2. 配置 Nginx
创建配置文件 `/etc/nginx/sites-available/nano-banana`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 日志文件
    access_log /var/log/nginx/nano-banana-access.log;
    error_log /var/log/nginx/nano-banana-error.log;

    # 客户端上传限制
    client_max_body_size 10M;

    # 静态文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 代理到 Node.js 应用
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 3. 启用配置
```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/nano-banana /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx

# 设置开机自启
sudo systemctl enable nginx
```

### 方案三：配置 SSL 证书（HTTPS）

#### 使用 Let's Encrypt
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书并自动配置 Nginx
sudo certbot --nginx -d your-domain.com

# 测试自动续期
sudo certbot renew --dry-run

# 设置自动续期任务
sudo crontab -e
# 添加以下行（每天凌晨 2 点检查）
0 2 * * * certbot renew --quiet
```

完整的 HTTPS Nginx 配置:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 宝塔面板部署

### 1. 安装宝塔面板
```bash
# CentOS
yum install -y wget && wget -O install.sh https://download.bt.cn/install/install_6.0.sh && sh install.sh

# Ubuntu/Debian
wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh
```

### 2. 安装必要软件
在宝塔面板中安装：
- **Nginx** (Web 服务器)
- **MySQL 5.7+** (数据库)
- **PM2 管理器** (Node.js 进程管理)

### 3. 创建 Node.js 项目
1. 进入宝塔面板 → 网站 → Node 项目
2. 点击"添加 Node 项目"
3. 填写配置：
   - **项目名称**: Nano Banana
   - **项目路径**: /www/wwwroot/nano-banana
   - **启动文件**: server.js
   - **端口**: 3000
   - **运行方式**: PM2

### 4. 上传代码
通过宝塔文件管理器上传项目文件，或使用 Git：
```bash
cd /www/wwwroot/nano-banana
git clone https://github.com/pili1121/Nano-Banana.git .
cd OpenSource_Banana
```

### 5. 安装依赖
在宝塔面板的终端或 SSH 中执行：
```bash
cd /www/wwwroot/nano-banana/OpenSource_Banana
npm install --production
```

### 6. 配置数据库
1. 在宝塔面板 → 数据库中创建数据库
2. 导入 `database.sql` 文件
3. 配置 `.env` 文件中的数据库信息

### 7. 启动项目
在宝塔面板的 Node 项目管理中点击"启动"。

### 8. 配置反向代理
1. 在宝塔面板 → 网站中添加站点
2. 设置反向代理到 `http://127.0.0.1:3000`
3. 配置 SSL 证书（可使用宝塔自带的 Let's Encrypt）

---

## Docker 部署

本项目提供两种 Docker 部署方式：

### 方式一：完整 Docker Compose 部署（推荐）

**功能特点**：
- ✅ 自动构建本地镜像
- ✅ 包含 MySQL + Redis + 应用服务
- ✅ 数据持久化
- ✅ 健康检查
- ✅ 可选 Nginx 反向代理
- ✅ 详细的配置说明

**快速开始**：
```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，修改密码和 API 密钥

# 2. 启动所有服务
docker compose up -d

# 3. 查看日志
docker compose logs -f
```

**详细文档**：请参考 [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)

**支持的命令**：
```bash
# 启动（开发环境）
docker compose up -d

# 启动（生产环境，包含 Nginx）
docker compose --profile production up -d

# 查看状态
docker compose ps

# 查看日志
docker compose logs -f app

# 停止服务
docker compose down

# 备份数据库
docker compose exec mysql mysqldump -u root -p nano_banana > backup.sql
```

---

### 方式二：简化版 Docker Compose 部署

**创建 Dockerfile**：
```dockerfile
FROM node:16-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm install --production

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "server.js"]
```

**创建简化版 docker-compose.yml**：
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_USER=root
      - DB_PASSWORD=root_password
      - DB_NAME=nano_banana
      - JWT_SECRET=your_jwt_secret
      - AI_API_BASE_URL=https://api.fengjungpt.com
      - AI_API_KEY=sk-your-api-key
    depends_on:
      - mysql
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped

  mysql:
    image: mysql:5.7
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=nano_banana
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

volumes:
  mysql_data:
```

**启动容器**：
```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止容器
docker-compose down

# 重启容器
docker-compose restart
```

**注意**：简化版仅包含基本功能，推荐使用完整版部署方式以获得更好的体验和功能。

---

## 常见问题

### Q1: 端口被占用
```bash
# 查看端口占用
lsof -i :3000  # Linux/macOS
netstat -ano | findstr :3000  # Windows

# 终止进程
kill -9 <PID>  # Linux/macOS
taskkill /PID <PID> /F  # Windows

# 或修改 .env 中的 PORT 配置
```

### Q2: 数据库连接失败
检查：
1. MySQL 服务是否启动
2. 数据库用户名和密码是否正确
3. 数据库名称是否存在
4. 防火墙是否阻止连接

```bash
# 测试 MySQL 连接
mysql -h localhost -u root -p

# 检查 MySQL 服务状态
systemctl status mysql  # Linux
```

### Q3: npm install 失败
```bash
# 清除缓存
npm cache clean --force
rm -rf node_modules package-lock.json

# 使用淘宝镜像
npm install --registry=https://registry.npmmirror.com

# 或使用 pnpm
npm install -g pnpm
pnpm install
```

### Q4: 邮箱验证码发送失败
检查：
1. SMTP 服务器地址和端口是否正确
2. 邮箱授权码是否正确（不是登录密码）
3. 网络是否能连接到 SMTP 服务器

QQ 邮箱获取授权码：
- 登录 QQ 邮箱
- 设置 → 账户 → POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务
- 开启服务并生成授权码

### Q5: 图片生成失败
检查：
1. AI API Key 是否有效
2. API 余额是否充足
3. 网络是否能访问 AI API 服务
4. 查看服务器日志获取详细错误

```bash
# 查看 PM2 日志
pm2 logs nano-banana

# 查看错误日志
tail -f logs/err.log
```

### Q6: 文件上传失败
检查：
1. `uploads` 目录是否存在
2. 目录权限是否正确
3. 磁盘空间是否充足

```bash
# 创建上传目录
mkdir -p uploads

# 设置权限
chmod 755 uploads

# 检查磁盘空间
df -h
```

### Q7: PM2 进程崩溃
```bash
# 查看日志
pm2 logs nano-banana

# 重启应用
pm2 restart nano-banana

# 查看内存使用
pm2 monit

# 设置最大内存限制
pm2 start server.js --max-memory-restart 500M
```

---

## 🔒 安全建议

### 1. 环境变量
- 永远不要将 `.env` 文件提交到 Git
- 使用强随机字符串作为 JWT_SECRET
- 定期更换敏感密钥

### 2. 数据库安全
- 使用强密码
- 不要使用 root 账户连接
- 定期备份数据库

```bash
# 备份数据库
mysqldump -u root -p nano_banana > backup_$(date +%Y%m%d).sql

# 恢复数据库
mysql -u root -p nano_banana < backup_20251208.sql
```

### 3. 防火墙配置
```bash
# 只开放必要端口
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 4. 定期更新
```bash
# 更新系统
sudo apt update && sudo apt upgrade

# 更新依赖
npm update

# 检查安全漏洞
npm audit
npm audit fix
```

---

## 📊 监控和维护

### 1. 日志监控
```bash
# PM2 日志
pm2 logs nano-banana --lines 100

# Nginx 访问日志
tail -f /var/log/nginx/nano-banana-access.log

# Nginx 错误日志
tail -f /var/log/nginx/nano-banana-error.log
```

### 2. 性能监控
```bash
# PM2 监控
pm2 monit

# 系统资源监控
htop
```

### 3. 自动化备份
```bash
# 创建备份脚本
cat > /root/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p'your_password' nano_banana > /backup/db_${DATE}.sql
tar -czf /backup/uploads_${DATE}.tar.gz /www/wwwroot/nano-banana/uploads
find /backup -mtime +7 -delete
EOF

# 设置权限
chmod +x /root/backup.sh

# 添加到 crontab (每天凌晨 3 点备份)
crontab -e
0 3 * * * /root/backup.sh
```

---

## 🎯 性能优化

### 1. 启用 Gzip 压缩
项目已内置 compression 中间件，确保在生产环境启用。

### 2. 配置 CDN
将静态资源（CSS、JS、图片）部署到 CDN 以加速访问。

### 3. 数据库优化
```sql
-- 添加索引
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_creations_user_id ON creations(user_id);
CREATE INDEX idx_creations_created_at ON creations(created_at);

-- 定期优化表
OPTIMIZE TABLE users;
OPTIMIZE TABLE creations;
```

### 4. Redis 缓存（可选）
安装 Redis 缓存热点数据，减少数据库压力。

---

## 📞 获取帮助

如遇到部署问题，请：
1. 查看服务器日志
2. 检查 [常见问题](#常见问题)
3. 提交 [GitHub Issue](https://github.com/pili1121/Nano-Banana/issues)

---

**祝部署顺利！** 🎉
