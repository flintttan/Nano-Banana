# 🛠️ 数据库索引重复错误修复

## 📋 问题描述

启动时出现错误：
```
❌ 执行数据库脚本失败 (database-batch.sql): Duplicate key name 'idx_batch_queue_status'
❌ 数据库自动初始化过程失败: Duplicate key name 'idx_batch_queue_status'
⚠️ 应用启动初始化失败: Duplicate key name 'idx_batch_queue_status'
```

## ✅ 解决方案

### 方案1: 重新运行修复脚本（推荐）

```bash
# 1. 进入MySQL控制台
mysql -u root -p

# 2. 选择数据库
USE nano_banana;

# 3. 运行修复脚本
SOURCE /path/to/Nano-Banana/fix-database-index.sql;

# 4. 退出MySQL
EXIT;
```

### 方案2: 手动修复

```sql
-- 1. 删除重复索引
DROP INDEX IF EXISTS idx_batch_queue_status ON batch_queues;

-- 2. 验证表结构
SHOW CREATE TABLE batch_queues;

-- 3. 重新启动应用
npm start
```

### 方案3: 清理数据库重新初始化

```bash
# 1. 停止应用
Ctrl+C

# 2. 清理数据库
mysql -u root -p -e "DROP DATABASE IF EXISTS nano_banana; CREATE DATABASE nano_banana CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"

# 3. 重新初始化
npm start
```

## 🔧 预防措施

已经修改了 `database-batch.sql` 文件，将索引创建改为**幂等操作**：

```sql
-- 现在的代码会先检查索引是否存在
SET @sql := IF (
  NOT EXISTS (
    SELECT 1 FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'batch_queues' AND INDEX_NAME = 'idx_batch_queue_status'
  ),
  'CREATE INDEX idx_batch_queue_status ON batch_queues(status, created_at);',
  'SELECT 1'
);
```

这样即使脚本运行多次也不会出现重复索引错误。

## 📊 修复后的索引

修复后应该有以下索引：

1. **batch_queues表**:
   - `idx_user_id` (user_id)
   - `idx_status` (status)
   - `idx_batch_queue_status` (status, created_at) ✓

2. **batch_tasks表**:
   - `idx_queue_id` (queue_id)
   - `idx_user_id` (user_id)
   - `idx_status` (status)
   - `idx_batch_task_queue_status` (queue_id, status) ✓

## 🚀 重新启动

修复后，重新启动应用：

```bash
npm start
```

应该看到成功启动信息：

```
✅ 数据库初始化完成
🚀 服务器运行在 http://localhost:3000
```

## 📞 常见问题

**Q: 修复后仍然报错怎么办？**

A: 请检查是否所有相关文件都已更新：
- `database-batch.sql` (已修复)
- `fix-database-index.sql` (已创建)

**Q: 可以跳过数据库初始化吗？**

A: 可以设置环境变量跳过自动初始化：
```bash
SKIP_DB_INIT=true npm start
```

但建议还是修复数据库问题。

---

**修复完成时间**: 2024-12-10
**状态**: ✅ 已修复，可重新启动
