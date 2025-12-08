# 💾 数据备份与恢复指南

本文档说明如何使用简化的 Docker Compose 配置进行数据备份和恢复。

---

## 📁 数据目录结构

所有持久化数据现在存储在 `data/` 目录中：

```
data/
├── mysql/          # MySQL 数据库文件
├── redis/          # Redis 持久化文件
├── uploads/        # 用户上传的图片
├── logs/           # 应用日志文件
└── nginx/          # Nginx 日志文件
```

---

## 🔄 备份数据

### 方法一：使用 Docker Compose 命令

```bash
# 备份 MySQL 数据库
docker compose exec -T mysql mysqldump -u root -p nano_banana \
  > data/mysql/backup_$(date +%Y%m%d_%H%M%S).sql

# 或直接备份整个 data 目录
tar -czf data_backup_$(date +%Y%m%d_%H%M%S).tar.gz data/
```

### 方法二：使用 Makefile

```bash
# 查看备份命令
make help | grep backup

# 备份数据（如果 Makefile 已配置）
make backup
```

### 方法三：复制 data 目录

```bash
# 停止服务
docker compose down

# 复制 data 目录
cp -r data data_backup_$(date +%Y%m%d_%H%M%S)

# 重启服务
docker compose up -d
```

---

## 🔄 恢复数据

### 恢复 MySQL 数据库

```bash
# 方法1：使用备份文件
docker compose exec -T mysql mysql -u root -p nano_banana \
  < data/mysql/backup_20251209_120000.sql

# 方法2：恢复整个 data 目录
# 停止服务
docker compose down

# 删除现有 data 目录
rm -rf data/

# 解压备份
tar -xzf data_backup_20251209_120000.tar.gz

# 重启服务
docker compose up -d
```

---

## ⚠️ 注意事项

1. **备份时机**
   - 建议在停止服务后进行备份
   - 或在应用低峰期进行备份

2. **备份频率**
   - 建议每日自动备份
   - 重要更新前手动备份

3. **数据安全**
   - 备份文件包含敏感信息，请妥善保管
   - 定期清理旧备份文件

4. **恢复测试**
   - 定期测试备份文件的可用性
   - 建议在测试环境先验证备份

---

## 📝 自动化备份脚本

创建每日自动备份脚本：

```bash
#!/bin/bash
# scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份 MySQL
docker compose exec -T mysql mysqldump -u root -p nano_banana \
  | gzip > $BACKUP_DIR/mysql_$DATE.sql.gz

# 备份上传文件
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz data/uploads/

# 清理7天前的备份
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

设置定时任务：

```bash
# 每天凌晨2点备份
crontab -e
0 2 * * * /path/to/scripts/backup.sh >> /var/log/backup.log 2>&1
```

---

## 🔍 验证数据

```bash
# 检查 MySQL 数据
ls -lh data/mysql/

# 检查上传文件
ls -lh data/uploads/

# 检查日志
ls -lh data/logs/

# 验证 MySQL 连接
docker compose exec mysql mysqladmin ping -h localhost
```

---

**备份重要提醒**：
- 数据无价，定期备份！
- 测试备份文件可用性！
- 妥善保管备份文件！
