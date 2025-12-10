# 🎨 Nano Banana AI - 全新工作台界面

## 🚀 设计概述

这是一个完全重新设计的前端界面，采用**现代化深色主题 + Workspace工作流模式**，专为AI图像生成应用打造。界面设计灵感来源于Figma、Notion等现代创作工具。

---

## ✨ 核心特性

### 🎯 设计理念
- **Workspace工作台模式** - 专业创作工具的布局方式
- **深色主题** - 减少视觉疲劳，适合长时间创作
- **彩色强调** - 使用紫色/蓝色渐变突出重要元素
- **卡片化设计** - 模块化、可复用的组件系统

### 🎨 视觉设计
- **配色方案**: 深色背景 (#0a0e1a) + 紫色/蓝色强调 (#8b5cf6, #3b82f6)
- **字体**: Inter - 现代、清晰的无衬线字体
- **圆角**: 统一使用 6-18px 圆角，视觉柔和
- **阴影**: 多层阴影系统，营造层次感
- **动效**: 平滑过渡动画，提升交互体验

---

## 📱 页面架构

### 整体布局
```
┌─────────────────────────────────────────┐
│  🎨 Nano Banana AI 工作台                │
├─────────┬─────────────────────┬──────────┤
│         │                     │          │
│  左侧   │     主工作区域       │  右侧    │
│  导航   │                     │  上下文  │
│         │                     │          │
│ • 工作台 │  [动态加载内容]     │ • 任务   │
│ • 工作室 │                     │ • 快捷键 │
│ • 编辑器 │                     │ • 提示   │
│ • 批量  │                     │          │
│ • 画廊  │                     │          │
│ • 灵感  │                     │          │
│ • 用户  │                     │          │
│ • 管理  │                     │          │
│         │                     │          │
└─────────┴─────────────────────┴──────────┘
```

### 页面详情

#### 1. 🏠 工作台首页 (`/`)
- **功能**: 仪表盘 + 快速入口
- **组件**:
  - 欢迎区域
  - 快速操作卡片 (4个主要功能入口)
  - 统计卡片 (今日生成、总作品、剩余积分)
  - 最近活动列表
- **交互**: 点击卡片直接跳转对应页面

#### 2. 🎨 生成工作室 (`/studio`)
- **功能**: 文本生成图像
- **布局**: 3栏式
  - 左侧: 创作参数 (提示词、模型、尺寸)
  - 中央: 实时预览画布
  - 右侧: 上下文信息
- **特性**:
  - 大尺寸文本框
  - 模型下拉选择
  - 一键生成按钮
  - 实时进度显示

#### 3. ✏️ 编辑工作室 (`/editor`)
- **功能**: 图像编辑与重绘
- **布局**: 2栏式
  - 左侧: 原图上传区
  - 右侧: 编辑后预览
  - 底部: 编辑参数
- **特性**:
  - 拖拽上传
  - 对比预览模式
  - 编辑提示词
  - 编辑强度控制

#### 4. 📦 批量处理中心 (`/batch`)
- **功能**: 批量图像处理
- **布局**: 2栏式
  - 左侧: 批量上传区 + 图片列表
  - 右侧: 任务队列可视化
- **特性**:
  - 拖拽上传 (最多50张)
  - 队列状态实时更新
  - 任务进度条
  - 失败重试机制

#### 5. 🖼️ 历史画廊 (`/gallery`)
- **功能**: 查看所有历史作品
- **布局**: 网格式
  - 瀑布流布局
  - 高级筛选工具栏
  - 图片卡片展示
- **特性**:
  - 无限滚动加载
  - 快速筛选
  - 标签系统
  - 批量操作

#### 6. 💡 灵感库 (`/inspirations`)
- **功能**: 浏览和管理灵感
- **布局**: 卡片网格
- **特性**:
  - 灵感卡片展示
  - 一键应用到生成器
  - 分类管理
  - 收藏功能

#### 7. 👤 用户中心 (`/profile`)
- **功能**: 个人信息管理
- **组件**:
  - 用户信息卡片
  - API密钥管理面板
  - 积分/使用统计
  - 每日签到
- **特性**:
  - API密钥CRUD
  - 使用历史图表
  - 签到奖励

#### 8. 🛠️ 管理控制台 (`/admin`)
- **功能**: 管理员专用 (仅管理员可见)
- **模块**:
  - 用户管理
  - 系统设置
  - AI模型管理
  - 数据统计
- **特性**:
  - 实时数据监控
  - 批量用户操作
  - 系统配置面板

#### 9. 🔐 登录页面 (`/login`)
- **功能**: 用户认证
- **特性**:
  - 登录/注册切换
  - 邮箱验证码
  - 表单验证
  - 渐变背景

---

## 🧩 组件系统

### 样式文件结构
```
styles/
├── workspace.css           # 全局样式 + 设计系统
├── components/
│   ├── sidebar.css        # 侧边栏组件
│   ├── canvas.css         # 画布组件
│   ├── queue.css          # 队列组件
│   └── cards.css          # 卡片组件
```

### CSS设计系统

#### 颜色变量
```css
--bg-primary: #0a0e1a      /* 主背景 */
--bg-secondary: #131826    /* 次背景 */
--bg-tertiary: #1a1f2e     /* 三级背景 */
--bg-elevated: #242936     /* 浮层背景 */

--text-primary: #e4e7ee    /* 主文字 */
--text-secondary: #a0a7b5  /* 次文字 */
--text-tertiary: #6b7280   /* 三级文字 */

--accent-purple: #8b5cf6   /* 紫色强调 */
--accent-blue: #3b82f6     /* 蓝色强调 */
--accent-green: #10b981    /* 绿色成功 */
--accent-yellow: #f59e0b   /* 黄色警告 */
--accent-red: #ef4444      /* 红色错误 */
```

#### 通用组件

**按钮 (`.btn`)**
```html
<button class="btn btn-primary">主要按钮</button>
<button class="btn btn-secondary">次要按钮</button>
<button class="btn btn-ghost">透明按钮</button>
```

**卡片 (`.card`)**
```html
<div class="card">
  <div class="card-header">
    <div class="card-title">标题</div>
    <div class="card-subtitle">副标题</div>
  </div>
  <div class="card-content">
    内容区域
  </div>
</div>
```

**输入框 (`.input`)**
```html
<input type="text" class="input" placeholder="请输入...">
<textarea class="textarea" placeholder="多行文本..."></textarea>
```

**状态指示器 (`.status-indicator`)**
```html
<span class="status-indicator status-success">成功</span>
<span class="status-indicator status-warning">警告</span>
<span class="status-indicator status-error">错误</span>
<span class="status-indicator status-info">信息</span>
```

---

## 💻 JavaScript架构

### 文件结构
```
scripts/
├── api.js          # API客户端封装
└── workspace.js    # 工作台通用逻辑
```

### APIClient类
提供完整的API调用封装，包括：

**认证模块**
- `sendCode(email)` - 发送验证码
- `register(email, code, password)` - 注册
- `login(email, password)` - 登录
- `getCurrentUser()` - 获取当前用户
- `logout()` - 登出

**图像生成模块**
- `generateImage(data)` - 生成图像
- `editImage(images, prompt, model)` - 编辑图像
- `getHistory(page, limit)` - 获取历史
- `deleteImage(id)` - 删除图像

**批量处理模块**
- `createBatchTask(...)` - 创建批量任务
- `getQueues()` - 获取队列列表
- `cancelQueue(queueId)` - 取消队列
- `retryTask(taskId)` - 重试任务

**管理员模块**
- `getUsers(page, limit)` - 获取用户列表
- `updateUserPoints(userId, points)` - 更新积分
- `getSettings()` - 获取设置
- `updateMailSettings(data)` - 更新邮件设置

### Workspace类
处理工作台通用逻辑：

**核心功能**
- `init()` - 初始化工作台
- `loadCurrentUser()` - 加载用户信息
- `navigateTo(page)` - 页面导航
- `loadPageContent(page)` - 加载页面内容

**页面加载方法**
- `loadWorkspacePage(container)` - 工作台首页
- `loadStudioPage(container)` - 生成工作室
- `loadEditorPage(container)` - 编辑工作室
- `loadBatchPage(container)` - 批量处理
- `loadGalleryPage(container)` - 历史画廊
- `loadProfilePage(container)` - 用户中心
- `loadInspirationsPage(container)` - 灵感库
- `loadAdminPage(container)` - 管理控制台

---

## 🎮 交互设计

### 导航系统
- **左侧导航**: 固定侧边栏，显示所有功能入口
- **移动端适配**: 侧边栏可收起，点击遮罩层关闭
- **活跃状态**: 当前页面高亮显示
- **徽章**: 显示待处理任务数量

### 快捷键
- `Ctrl+N` - 快速新建生成
- `Ctrl+S` - 保存参数
- `Ctrl+Z` - 撤销操作
- `空格键` - 预览大图

### 拖拽功能
- 拖拽图片到编辑器
- 拖拽灵感到生成器
- 拖拽调整批量队列顺序

### 实时反馈
- 生成进度实时显示
- 队列状态自动刷新
- 错误即时提示
- 成功操作确认

---

## 📱 响应式设计

### 断点设置
- **桌面端** (>1200px): 3栏布局 (侧边栏 + 主内容 + 上下文)
- **平板端** (768-1200px): 2栏布局 (侧边栏可收起 + 主内容)
- **手机端** (<768px): 1栏布局 (底部导航 + 全屏内容)

### 适配特性
- 侧边栏自动隐藏
- 工具栏折叠
- 卡片堆叠排列
- 触摸友好的按钮尺寸

---

## 🚀 快速开始

### 1. 启动应用
```bash
npm start
# 或
docker-compose up
```

### 2. 访问界面
- 主页: http://localhost:3000/
- 登录页: http://localhost:3000/login

### 3. 功能测试
1. 注册/登录账户
2. 进入工作台
3. 尝试生成工作室
4. 测试编辑功能
5. 体验批量处理

---

## 🎯 设计亮点

### 1. **专业级工作流**
- 类似Figma、Notion的布局
- 左侧导航 + 主工作区 + 右侧上下文
- 三栏式信息架构

### 2. **现代化视觉**
- 深色主题减少疲劳
- 渐变强调色突出重点
- 统一的设计语言

### 3. **高效交互**
- 拖拽上传
- 实时预览
- 快捷键支持
- 上下文菜单

### 4. **组件化架构**
- 可复用的CSS组件
- 模块化的JavaScript
- 易于维护和扩展

### 5. **完整功能覆盖**
- 基于46个API端点设计
- 涵盖所有用户场景
- 管理员专用界面

---

## 📦 技术栈

- **HTML5**: 语义化标签
- **CSS3**: 自定义属性、Grid、Flexbox
- **Vanilla JavaScript**: ES6+、模块化
- **Google Fonts**: Inter字体
- **RESTful API**: 完整的后端集成

---

## 🎨 设计规范

### 间距系统
- 基础单位: 4px
- 常用间距: 8px, 12px, 16px, 20px, 24px, 32px, 40px

### 圆角系统
- 小: 6px (按钮、小元素)
- 中: 10px (输入框)
- 大: 14px (卡片)
- 超大: 18px (大卡片)

### 阴影系统
- sm: 轻微阴影
- md: 中等阴影
- lg: 明显阴影
- xl: 突出阴影

---

## 🔮 未来规划

### 短期优化
- [ ] 添加主题切换 (深色/浅色)
- [ ] 实现图片懒加载
- [ ] 添加键盘快捷键提示
- [ ] 优化移动端体验

### 中期增强
- [ ] PWA支持 (离线使用)
- [ ] 图片压缩和优化
- [ ] 批量操作优化
- [ ] 性能监控面板

### 长期愿景
- [ ] 插件系统
- [ ] 自定义工作流
- [ ] 协作功能
- [ ] 更多AI模型集成

---

## 📄 许可证

MIT License - 详见 LICENSE 文件

---

## 🙏 致谢

感谢所有为现代Web设计做出贡献的开源项目和设计师们。

**Nano Banana AI Team** © 2024
