const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const next = require('next');
require('dotenv').config();

// 从导出的对象中，通过解构赋值获取数据库相关工具函数
const { connectDB, ensureDatabaseInitialized } = require('./config/database');
const { initializeAdminUser } = require('./utils/adminInit');

const authRoutes = require('./routes/auth');
const imageRoutes = require('./routes/image');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const batchRoutes = require('./routes/batch');

const app = express();

// 告诉 Express 应用它运行在反向代理（如 Nginx）后面，并信任代理
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';

// 初始化 Next.js
const nextApp = next({
  dev: false, // 在生产环境中始终使用构建后的版本
  dir: path.join(__dirname, 'frontend'),
  conf: {
    distDir: '.next'
  }
});
const handle = nextApp.getRequestHandler();

const queueService = require('./services/queueService');

// 在应用启动时串行执行：连接数据库 -> 初始化/检查表结构 -> 初始化管理员 -> 初始化队列服务 -> 准备 Next.js
(async () => {
  try {
    await connectDB();
    await ensureDatabaseInitialized();
    await initializeAdminUser();
    await queueService.initialize();

    // 准备 Next.js 应用
    console.log('🔄 正在准备 Next.js 应用...');
    await nextApp.prepare();
    console.log('✅ Next.js 应用准备完成');
  } catch (error) {
    console.error('⚠️ 应用启动初始化失败:', error.message || error);
    process.exit(1);
  }
})();

// ============== 安全中间件 ==============
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "https://cdn.tailwindcss.com", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:", "picsum.photos"],
      connectSrc: ["'self'", process.env.AI_API_BASE_URL || "https://api.openai.com"],
      frameSrc: ["'self'"],
      fontSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// ============== 压缩中间件 ==============
app.use(compression());

// ============== 日志中间件 ==============
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============== 速率限制 ==============
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: '请求过于频繁，请稍后再试'
  }
});
app.use('/api/', limiter);

// ============== CORS配置 ==============
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ============== 解析请求体 ==============
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============== 静态文件服务配置 ==============
// Serve Next.js static files
app.use('/_next', express.static(path.join(__dirname, 'frontend/.next')));

// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve Next.js public assets
app.use(express.static(path.join(__dirname, 'frontend/public')));

// ============== 创建上传目录 ==============
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ============== API 路由 ==============
app.use('/api/auth', authRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/batch', batchRoutes);

// ============== 健康检查端点 ==============
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ============== Next.js 路由处理 ==============
// 所有非 API 路由都交给 Next.js 处理
app.all('*', (req, res) => {
  return handle(req, res);
});

// ============== 全局错误处理中间件 ==============
app.use((err, req, res, next) => {
  console.error('❌ 全局错误:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || '服务器内部错误';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============== 启动服务器 ==============
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`📝 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 前端: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
});

// ============== 优雅关闭 ==============
process.on('SIGTERM', () => {
  console.log('👋 收到 SIGTERM 信号，正在优雅关闭...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 收到 SIGINT 信号，正在优雅关闭...');
  process.exit(0);
});
