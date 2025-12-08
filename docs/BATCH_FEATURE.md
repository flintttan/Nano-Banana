# 批量图生图功能说明

## 功能概述

批量图生图功能允许用户一次性上传多张图片，使用统一的提示词进行批量处理，系统会通过队列管理自动处理所有图片。

## 主要特性

### 1. 批量上传
- 支持拖拽文件夹上传
- 支持拖拽多个图片文件
- 支持点击选择文件（最多50张）
- 支持的格式：JPG, PNG, GIF, WebP等

### 2. 统一提示词
- 所有图片使用相同的提示词进行处理
- 支持预设提示词快速选择
- 管理员可在后台配置预设提示词列表

### 3. 队列管理
- 自动队列处理，无需手动干预
- 管理员可配置全局并发数（1-10）
- 实时显示处理进度
- 支持失败重试（最多2次）

### 4. 进度监控
- 实时显示队列状态
- 显示每个任务的处理进度
- 支持查看历史批次

### 5. 图片编辑
- 生成的图片可点击编辑按钮
- 重新输入提示词进行二次调整
- 保留原始图片和生成图片

## 数据库表结构

### system_config
系统配置表，存储全局并发数等配置
```sql
- config_key: 配置键（如 batch_concurrency）
- config_value: 配置值
- description: 配置说明
```

### preset_prompts
预设提示词表
```sql
- title: 提示词标题
- content: 提示词内容
- category: 分类
- sort_order: 排序
- is_active: 是否启用
```

### batch_queues
批量任务队列表
```sql
- user_id: 用户ID
- batch_name: 批次名称
- prompt: 统一提示词
- model: 使用的模型
- total_images: 总图片数
- completed_images: 已完成数
- failed_images: 失败数
- status: 队列状态（pending/processing/completed/failed/cancelled）
```

### batch_tasks
批量任务明细表
```sql
- queue_id: 队列ID
- user_id: 用户ID
- original_image_url: 原始图片URL
- original_filename: 原始文件名
- prompt: 提示词
- model: 模型
- generated_image_url: 生成的图片URL
- status: 任务状态（pending/processing/completed/failed）
- error_message: 错误信息
- retry_count: 重试次数
```

## API接口

### 用户端API

#### 创建批量任务
```
POST /api/batch/create
Headers: Authorization: Bearer {token}
Body: FormData
  - images: 图片文件数组（最多50张）
  - prompt: 提示词
  - model: 模型ID
  - batchName: 批次名称（可选）

Response:
{
  "success": true,
  "queueId": 123,
  "totalImages": 10,
  "usedUserKey": false
}
```

#### 获取队列状态
```
GET /api/batch/queue/:queueId
Headers: Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "queue": {...},
    "tasks": [...]
  }
}
```

#### 获取用户的所有队列
```
GET /api/batch/queues?limit=20
Headers: Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [...]
}
```

#### 取消队列
```
POST /api/batch/queue/:queueId/cancel
Headers: Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "队列已取消"
}
```

#### 重试失败的任务
```
POST /api/batch/task/:taskId/retry
Headers: Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "任务已重新加入队列"
}
```

#### 获取预设提示词
```
GET /api/batch/presets
Headers: Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "高清增强",
      "content": "masterpiece, best quality, ultra detailed, 8k resolution",
      "category": "quality"
    }
  ]
}
```

### 管理员API

#### 获取并发数配置
```
GET /api/admin/config/concurrency
Headers: Authorization: Bearer {admin_token}

Response:
{
  "success": true,
  "data": {
    "concurrency": 3
  }
}
```

#### 更新并发数配置
```
POST /api/admin/config/concurrency
Headers: Authorization: Bearer {admin_token}
Body: {
  "concurrency": 5
}

Response:
{
  "success": true
}
```

#### 预设提示词管理
```
GET /api/admin/presets
POST /api/admin/presets
PUT /api/admin/presets/:id
DELETE /api/admin/presets/:id
Headers: Authorization: Bearer {admin_token}
```

#### 批量任务监控
```
GET /api/admin/batch/queues
GET /api/admin/batch/stats
Headers: Authorization: Bearer {admin_token}
```

## 使用流程

### 用户端

1. **访问批量图生图页面**
   - 在主页面点击"批量图生图"Tab

2. **上传图片**
   - 拖拽文件夹或多个图片文件到上传区域
   - 或点击上传区域选择文件

3. **输入提示词**
   - 在提示词输入框输入描述
   - 或从预设提示词列表中选择

4. **选择模型**
   - 选择要使用的AI模型

5. **开始批量处理**
   - 点击"开始批量生成"按钮
   - 系统自动创建队列并开始处理

6. **查看进度**
   - 实时查看处理进度
   - 查看已完成的图片

7. **编辑图片**
   - 点击生成的图片的"编辑"按钮
   - 重新输入提示词进行调整

### 管理员端

1. **配置并发数**
   - 登录管理员面板
   - 进入"批量配置"页面
   - 设置全局并发数（1-10）

2. **管理预设提示词**
   - 在"批量配置"页面添加预设提示词
   - 设置标题、内容和分类
   - 删除不需要的预设

3. **监控任务**
   - 进入"任务监控"页面
   - 查看所有用户的批量任务
   - 查看统计数据

## 队列处理机制

### 并发控制
- 系统根据管理员配置的并发数同时处理多个任务
- 默认并发数为3
- 可在管理员面板调整（1-10）

### 重试机制
- 任务失败后自动重试
- 最多重试2次
- 超过重试次数标记为失败

### 状态流转
```
pending → processing → completed
                    ↓
                  failed (可重试)
```

## 积分消耗

- 使用系统API Key：每张图片消耗1积分
- 使用用户自己的API Key：不消耗积分
- 批量任务创建时预扣积分
- 任务失败不退还积分

## 注意事项

1. **文件限制**
   - 单个文件最大10MB
   - 单次最多上传50张图片

2. **队列处理**
   - 队列按创建时间顺序处理
   - 处理速度取决于并发数和AI服务响应时间

3. **积分管理**
   - 确保账户有足够积分
   - 或配置自己的API Key

4. **错误处理**
   - 失败的任务可以单独重试
   - 查看错误信息了解失败原因

## 技术实现

### 后端
- Node.js + Express
- MySQL数据库
- 队列服务（queueService.js）
- 并发控制和重试机制

### 前端
- Vanilla JavaScript
- Tailwind CSS
- 拖拽上传API
- 轮询更新队列状态

### 文件存储
- 原始图片：`/public/uploads/batch/`
- 生成图片：`/public/uploads/batch/`

## 部署说明

1. **运行数据库脚本**
   ```bash
   mysql -u root -p < database-batch.sql
   ```

2. **重启服务**
   ```bash
   npm start
   ```

3. **访问功能**
   - 用户端：访问主页面的"批量图生图"Tab
   - 管理员端：访问 `/api/admin/panel` 的"批量配置"和"任务监控"

## 故障排查

### 队列不处理
- 检查队列服务是否初始化
- 查看服务器日志
- 检查数据库连接

### 任务一直失败
- 检查AI服务配置
- 查看错误信息
- 检查网络连接

### 上传失败
- 检查文件大小和数量限制
- 检查文件格式
- 查看浏览器控制台错误

## 未来改进

- [ ] WebSocket实时推送进度
- [ ] 支持更多图片格式
- [ ] 批量下载功能
- [ ] 任务优先级设置
- [ ] 更详细的统计报表
