// routes/batch.js
// 批量图生图API路由

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { pool } = require('../config/database');
const queueService = require('../services/queueService');

// 配置multer用于批量文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 50 // 最多50个文件
  },
  fileFilter: (req, file, cb) => {
    // 只允许图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// 身份验证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.status(401).json({ error: '需要提供访问令牌' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: '无效或过期的访问令牌' });
    req.user = user;
    next();
  });
};

// ==========================================
// 批量任务相关API
// ==========================================

/**
 * 创建批量图生图任务
 * POST /api/batch/create
 */
router.post('/create', authenticateToken, upload.array('images', 50), async (req, res, next) => {
  console.log('API: /batch/create');
  try {
    const { prompt, model, batchName } = req.body;
    const imageFiles = req.files;
    const userId = req.user.id;

    // 验证参数
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: '提示词不能为空' });
    }

    if (!imageFiles || imageFiles.length === 0) {
      return res.status(400).json({ error: '请至少上传一张图片' });
    }

    if (imageFiles.length > 50) {
      return res.status(400).json({ error: '单次最多上传50张图片' });
    }

    // 检查用户积分（如果使用系统API Key）
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.execute(
        'SELECT drawing_points FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: '用户不存在' });
      }

      const currentPoints = users[0].drawing_points || 0;
      const requiredPoints = imageFiles.length;

      // 检查是否有用户自己的API Key
      const [userKeys] = await connection.execute(
        'SELECT api_key FROM user_api_config WHERE user_id = ? LIMIT 1',
        [userId]
      );

      const hasUserKey = userKeys.length > 0;

      if (!hasUserKey && currentPoints < requiredPoints) {
        return res.status(400).json({
          error: `积分不足，需要 ${requiredPoints} 积分，当前 ${currentPoints} 积分`
        });
      }

      // 创建批量队列
      const result = await queueService.createBatchQueue(
        userId,
        batchName || `批次_${Date.now()}`,
        prompt,
        model || 'nano-banana',
        imageFiles
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      // 如果使用系统API Key，预扣积分
      if (!hasUserKey) {
        await connection.execute(
          'UPDATE users SET drawing_points = drawing_points - ? WHERE id = ?',
          [requiredPoints, userId]
        );
      }

      res.json({
        success: true,
        message: '批量任务已创建',
        queueId: result.queueId,
        totalImages: imageFiles.length,
        usedUserKey: hasUserKey
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ 创建批量任务失败:', error);
    next(error);
  }
});

/**
 * 获取队列状态
 * GET /api/batch/queue/:queueId
 */
router.get('/queue/:queueId', authenticateToken, async (req, res, next) => {
  try {
    const { queueId } = req.params;
    const userId = req.user.id;

    // 验证队列所有权
    const [queue] = await pool.execute(
      'SELECT * FROM batch_queues WHERE id = ? AND user_id = ?',
      [queueId, userId]
    );

    if (queue.length === 0) {
      return res.status(404).json({ error: '队列不存在或无权限访问' });
    }

    const result = await queueService.getQueueStatus(queueId);

    if (!result.success) {
      throw new Error(result.error);
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ 获取队列状态失败:', error);
    next(error);
  }
});

/**
 * 获取用户的所有队列
 * GET /api/batch/queues
 */
router.get('/queues', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;

    const result = await queueService.getUserQueues(userId, limit);

    if (!result.success) {
      throw new Error(result.error);
    }

    res.json({
      success: true,
      data: result.queues
    });

  } catch (error) {
    console.error('❌ 获取用户队列失败:', error);
    next(error);
  }
});

/**
 * 取消队列
 * POST /api/batch/queue/:queueId/cancel
 */
router.post('/queue/:queueId/cancel', authenticateToken, async (req, res, next) => {
  try {
    const { queueId } = req.params;
    const userId = req.user.id;

    const result = await queueService.cancelQueue(queueId, userId);

    if (!result.success) {
      throw new Error(result.error);
    }

    res.json({
      success: true,
      message: '队列已取消'
    });

  } catch (error) {
    console.error('❌ 取消队列失败:', error);
    next(error);
  }
});

/**
 * 重新生成单个失败的任务
 * POST /api/batch/task/:taskId/retry
 */
router.post('/task/:taskId/retry', authenticateToken, async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    // 验证任务所有权
    const [task] = await pool.execute(
      'SELECT * FROM batch_tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    );

    if (task.length === 0) {
      return res.status(404).json({ error: '任务不存在或无权限' });
    }

    if (task[0].status !== 'failed') {
      return res.status(400).json({ error: '只能重试失败的任务' });
    }

    // 重置任务状态
    await pool.execute(
      `UPDATE batch_tasks
       SET status = 'pending', retry_count = 0, error_message = NULL
       WHERE id = ?`,
      [taskId]
    );

    // 启动队列处理
    queueService.startProcessing();

    res.json({
      success: true,
      message: '任务已重新加入队列'
    });

  } catch (error) {
    console.error('❌ 重试任务失败:', error);
    next(error);
  }
});

// ==========================================
// 预设提示词相关API
// ==========================================

/**
 * 获取所有预设提示词
 * GET /api/batch/presets
 */
router.get('/presets', authenticateToken, async (req, res, next) => {
  try {
    const [presets] = await pool.execute(
      `SELECT * FROM preset_prompts WHERE is_active = 1 ORDER BY sort_order ASC, id ASC`
    );

    res.json({
      success: true,
      data: presets
    });

  } catch (error) {
    console.error('❌ 获取预设提示词失败:', error);
    next(error);
  }
});

/**
 * 获取系统配置（并发数）
 * GET /api/batch/config
 */
router.get('/config', authenticateToken, async (req, res, next) => {
  try {
    const concurrency = queueService.getConcurrency();

    res.json({
      success: true,
      data: {
        concurrency
      }
    });

  } catch (error) {
    console.error('❌ 获取配置失败:', error);
    next(error);
  }
});

module.exports = router;
