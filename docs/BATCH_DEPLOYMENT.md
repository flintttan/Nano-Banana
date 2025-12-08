# 批量图生图功能部署指南

> 提示：在使用 Docker Compose 部署时，应用会在启动时自动检测数据库，
> 如发现批量相关表不存在，会自动执行 `database-batch.sql` 完成初始化。  
> 下述手动 SQL 命令主要用于非 Docker 环境或需要手工维护数据库时参考。

## 快速部署

### 1. 创建数据库表

运行以下命令创建批量图生图所需的数据库表（示例数据库名为 `nano_banana`）：

```bash
mysql -u root -p nano_banana < database-batch.sql
```

或者手动执行SQL：

```sql
-- 连接到数据库
USE nano_banana;

-- 执行 database-batch.sql 中的所有SQL语句
```

### 2. 重启服务

```bash
# 停止当前服务
pm2 stop nano-banana

# 重启服务
pm2 restart nano-banana

# 或者直接运行
npm start
```

### 3. 验证部署

#### 检查服务启动
查看服务器日志，确认以下信息：
```
✅ 队列服务初始化完成，并发数: 3
🚀 AI绘图服务器运行在端口 3000
```

#### 检查API端点
```bash
# 检查健康状态
curl http://localhost:3000/api/health

# 检查批量API（需要登录token）
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/batch/config
```

## 功能访问

### 用户端
1. 登录系统
2. 访问主页面
3. 点击"批量图生图"Tab（Codex生成的batch.html页面）
4. 开始使用批量功能

### 管理员端
1. 访问 `http://your-domain/api/admin/panel`
2. 使用管理员账号登录
3. 在左侧菜单找到"批量功能"分组
4. 点击"批量配置"设置并发数和预设提示词
5. 点击"任务监控"查看所有批量任务

## 配置说明

### 并发数配置
- 默认值：3
- 推荐范围：3-5（根据服务器性能调整）
- 最大值：10
- 配置位置：管理员面板 > 批量配置 > 并发数配置

### 预设提示词
系统已预置5个常用提示词：
1. 高清增强
2. 艺术风格
3. 写实风格
4. 动漫风格
5. 水彩画风

管理员可以添加更多预设提示词。

## 文件结构

```
Nano-Banana/
├── database-batch.sql          # 数据库表结构
├── server.js                   # 已更新，注册批量路由
├── routes/
│   ├── batch.js               # 批量图生图API路由
│   └── admin.js               # 已更新，添加批量管理API
├── services/
│   └── queueService.js        # 队列管理服务
├── public/
│   └── batch.html             # 批量图生图前端页面（Codex生成）
└── docs/
    └── BATCH_FEATURE.md       # 详细功能说明
```

## 常见问题

### Q: 队列不处理任务？
A: 检查以下几点：
1. 确认队列服务已初始化（查看启动日志）
2. 检查数据库连接是否正常
3. 查看 `batch_queues` 表中是否有待处理的队列
4. 检查服务器日志是否有错误信息

### Q: 任务一直失败？
A: 可能的原因：
1. AI服务配置错误（检查 `.env` 文件）
2. 网络连接问题
3. 图片格式不支持
4. 积分不足

### Q: 如何调整并发数？
A:
1. 登录管理员面板
2. 进入"批量配置"页面
3. 修改并发数（1-10）
4. 点击"保存配置"

### Q: 如何查看任务进度？
A:
- 用户端：在批量图生图页面实时查看
- 管理员端：在"任务监控"页面查看所有用户的任务

## 性能优化建议

### 1. 数据库优化
```sql
-- 定期清理已完成的旧任务（保留最近30天）
DELETE FROM batch_tasks WHERE completed_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
DELETE FROM batch_queues WHERE completed_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

### 2. 并发数调整
- 服务器配置较低：设置为 2-3
- 服务器配置中等：设置为 3-5
- 服务器配置较高：设置为 5-8

### 3. 文件清理
定期清理 `/public/uploads/batch/` 目录中的旧文件：
```bash
# 删除30天前的文件
find /path/to/Nano-Banana/public/uploads/batch/ -type f -mtime +30 -delete
```

## 监控和日志

### 查看队列状态
```sql
-- 查看当前队列统计
SELECT
    status,
    COUNT(*) as count,
    SUM(total_images) as total_images,
    SUM(completed_images) as completed_images
FROM batch_queues
GROUP BY status;
```

### 查看失败任务
```sql
-- 查看最近的失败任务
SELECT
    bt.*,
    bq.batch_name,
    u.username
FROM batch_tasks bt
JOIN batch_queues bq ON bt.queue_id = bq.id
JOIN users u ON bt.user_id = u.id
WHERE bt.status = 'failed'
ORDER BY bt.created_at DESC
LIMIT 20;
```

### 服务器日志
```bash
# 查看实时日志
pm2 logs nano-banana

# 查看错误日志
pm2 logs nano-banana --err
```

## 安全注意事项

1. **文件上传限制**
   - 已设置单文件最大10MB
   - 已设置单次最多50个文件
   - 已限制只能上传图片格式

2. **API访问控制**
   - 所有批量API都需要身份验证
   - 管理员API需要管理员权限

3. **积分管理**
   - 批量任务创建时预扣积分
   - 防止恶意消耗资源

## 升级说明

如果从旧版本升级，需要：

1. 备份数据库
```bash
mysqldump -u root -p nano_banana > backup_$(date +%Y%m%d).sql
```

2. 运行数据库迁移脚本
```bash
mysql -u root -p nano_banana < database-batch.sql
```

3. 更新代码
```bash
git pull origin feature/batch-image-edit
npm install
```

4. 重启服务
```bash
pm2 restart nano-banana
```

## 技术支持

如遇问题，请查看：
1. 服务器日志：`pm2 logs nano-banana`
2. 数据库日志：检查MySQL错误日志
3. 浏览器控制台：查看前端错误
4. 详细文档：`docs/BATCH_FEATURE.md`

## 下一步

- [ ] 测试批量上传功能
- [ ] 测试队列处理
- [ ] 测试管理员配置
- [ ] 测试图片编辑功能
- [ ] 性能测试和优化
