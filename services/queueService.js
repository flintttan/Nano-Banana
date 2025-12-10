// services/queueService.js
// 批量图生图队列管理服务

const { pool } = require('../config/database');
const aiService = require('./aiService');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class QueueService {
  constructor() {
    this.isProcessing = false;
    // 从环境变量读取并发数，默认为3
    this.currentConcurrency = parseInt(process.env.BATCH_CONCURRENCY) || 3;
    this.activeWorkers = 0;
    // 从环境变量读取最大重试次数，默认为2
    this.maxRetries = parseInt(process.env.BATCH_MAX_RETRIES) || 2;
  }

  /**
   * 初始化队列服务，加载配置
   */
  async initialize() {
    try {
      const [rows] = await pool.execute(
        'SELECT config_value FROM system_config WHERE config_key = ?',
        ['batch_concurrency']
      );
      if (rows.length > 0) {
        this.currentConcurrency = parseInt(rows[0].config_value) || 3;
      }
      console.log(`✅ 队列服务初始化完成，并发数: ${this.currentConcurrency}`);
    } catch (error) {
      console.error('❌ 队列服务初始化失败:', error);
    }
  }

  /**
   * 更新并发数配置
   */
  async updateConcurrency(newConcurrency) {
    try {
      await pool.execute(
        'UPDATE system_config SET config_value = ? WHERE config_key = ?',
        [newConcurrency.toString(), 'batch_concurrency']
      );
      this.currentConcurrency = newConcurrency;
      console.log(`✅ 并发数已更新为: ${newConcurrency}`);
      return { success: true };
    } catch (error) {
      console.error('❌ 更新并发数失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取当前并发数
   */
  getConcurrency() {
    return this.currentConcurrency;
  }

  /**
   * 创建批量任务队列
   */
  async createBatchQueue(userId, batchName, prompt, model, imageFiles) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 预先解析文件名与文件夹路径
      const normalizedFiles = imageFiles.map((file) => {
        const originalName = file.originalname || '';
        const normalizedName = originalName.replace(/\\\\/g, '/');
        const lastSlash = normalizedName.lastIndexOf('/');
        const folderPath = lastSlash > -1 ? normalizedName.slice(0, lastSlash) : '';
        const baseName = lastSlash > -1 ? normalizedName.slice(lastSlash + 1) : normalizedName;
        return { file, folderPath, baseName };
      });

      const uniqueFolderPaths = Array.from(
        new Set(normalizedFiles.map(item => item.folderPath).filter(Boolean))
      );

      let queueFolderPath = null;
      if (uniqueFolderPaths.length === 1) {
        queueFolderPath = uniqueFolderPaths[0];
      } else if (uniqueFolderPaths.length > 1) {
        const preview = uniqueFolderPaths.slice(0, 3).join(', ');
        queueFolderPath = preview + (uniqueFolderPaths.length > 3 ? ' 等' : '');
      }

      // 1. 创建队列记录（queue_type = 'batch' 表示普通批量图生图）
      const [queueResult] = await connection.execute(
        `INSERT INTO batch_queues (user_id, batch_name, prompt, model, total_images, status, folder_path, queue_type)
         VALUES (?, ?, ?, ?, ?, 'pending', ?, 'batch')`,
        [userId, batchName, prompt, model, normalizedFiles.length, queueFolderPath]
      );

      const queueId = queueResult.insertId;

      // 2. 保存上传的图片并创建任务记录
      const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'batch');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      for (const item of normalizedFiles) {
        const { file, folderPath, baseName } = item;
        const fileName = `${Date.now()}-${userId}-${baseName}`;
        const filePath = path.join(uploadsDir, fileName);
        const publicUrl = `/uploads/batch/${fileName}`;

        // 保存原始图片
        fs.writeFileSync(filePath, file.buffer);

        // 创建任务记录
        await connection.execute(
          `INSERT INTO batch_tasks (queue_id, user_id, original_image_url, original_filename, folder_path, prompt, model, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
          [queueId, userId, publicUrl, baseName, folderPath || null, prompt, model]
        );
      }

      await connection.commit();

      // 3. 启动队列处理
      this.startProcessing();

      return { success: true, queueId };
    } catch (error) {
      await connection.rollback();
      console.error('❌ 创建批量队列失败:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  }

  /**
   * 启动队列处理
   */
  async startProcessing() {
    if (this.isProcessing) {
      return; // 已经在处理中
    }

    this.isProcessing = true;
    console.log('🚀 队列处理已启动');

    while (true) {
      try {
        // 检查是否有待处理的任务
        const [pendingTasks] = await pool.execute(
          `SELECT bt.*, bq.status as queue_status
           FROM batch_tasks bt
           JOIN batch_queues bq ON bt.queue_id = bq.queue_id
           WHERE bt.status = 'pending' AND bq.status IN ('pending', 'processing')
           ORDER BY bt.created_at ASC
           LIMIT ?`,
          [this.currentConcurrency]
        );

        if (pendingTasks.length === 0) {
          // 没有待处理任务，检查是否有正在处理的任务
          const [processingTasks] = await pool.execute(
            'SELECT COUNT(*) as count FROM batch_tasks WHERE status = "processing"'
          );

          if (processingTasks[0].count === 0) {
            // 没有任何任务在处理，停止队列
            this.isProcessing = false;
            console.log('✅ 队列处理完成，所有任务已处理');
            break;
          }

          // 有任务在处理，等待一段时间后再检查
          await this.sleep(2000);
          continue;
        }

        // 处理任务（并发控制）
        const workers = [];
        for (let i = 0; i < Math.min(pendingTasks.length, this.currentConcurrency - this.activeWorkers); i++) {
          workers.push(this.processTask(pendingTasks[i]));
        }

        await Promise.all(workers);

        // 短暂延迟，避免过于频繁的数据库查询
        await this.sleep(1000);

      } catch (error) {
        console.error('❌ 队列处理出错:', error);
        await this.sleep(5000); // 出错后等待更长时间
      }
    }
  }

  /**
   * 处理单个任务
   */
  async processTask(task) {
    this.activeWorkers++;
    const connection = await pool.getConnection();

    try {
      // 1. 更新任务状态为处理中
      await connection.execute(
        `UPDATE batch_tasks SET status = 'processing', started_at = NOW() WHERE id = ?`,
        [task.id]
      );

      // 2. 更新队列状态为处理中
      await connection.execute(
        `UPDATE batch_queues SET status = 'processing' WHERE id = ?`,
        [task.queue_id]
      );

      // 3. 读取原始图片
      const imagePath = path.join(__dirname, '..', 'public', task.original_image_url);
      const imageBuffer = fs.readFileSync(imagePath);

      // 4. 调用AI服务进行图生图
      const result = await aiService.editImage({
        prompt: task.prompt,
        model: task.model,
        images: [{
          buffer: imageBuffer,
          originalname: task.original_filename
        }]
      });

      if (!result.success) {
        throw new Error(result.error || 'AI服务调用失败');
      }

      const temporaryImageUrl = result.data?.data?.[0]?.url;
      if (!temporaryImageUrl) {
        throw new Error('AI未返回图片URL');
      }

      // 5. 下载并保存生成的图片
      const fileName = `${Date.now()}-${task.user_id}-generated.png`;
      const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'batch');
      const filePath = path.join(uploadsDir, fileName);
      const publicUrl = `/uploads/batch/${fileName}`;

      const response = await axios({ url: temporaryImageUrl, responseType: 'stream' });
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // 6. 更新任务状态为完成
      await connection.execute(
        `UPDATE batch_tasks
         SET status = 'completed', generated_image_url = ?, completed_at = NOW()
         WHERE id = ?`,
        [publicUrl, task.id]
      );

      // 7. 更新队列统计
      await connection.execute(
        `UPDATE batch_queues
         SET completed_images = completed_images + 1
         WHERE id = ?`,
        [task.queue_id]
      );

      // 8. 将结果写入用户作品表，便于在「我的作品」中统一展示
      try {
        await connection.execute(
          `INSERT INTO creations (user_id, prompt, image_url, model, size, created_at, folder_path)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            task.user_id,
            task.prompt,
            publicUrl,
            task.model || null,
            null,
            new Date(),
            task.folder_path || null
          ]
        );
      } catch (insertErr) {
        console.error(`⚠️ 写入 creations 表失败（task ${task.id}）:`, insertErr.message);
      }

      // 9. 检查队列是否全部完成
      await this.checkQueueCompletion(task.queue_id, connection);

      console.log(`✅ 任务 ${task.id} 处理完成`);

    } catch (error) {
      console.error(`❌ 任务 ${task.id} 处理失败:`, error.message);

      // 重试逻辑
      if (task.retry_count < this.maxRetries) {
        await connection.execute(
          `UPDATE batch_tasks
           SET status = 'pending', retry_count = retry_count + 1, error_message = ?
           WHERE id = ?`,
          [error.message, task.id]
        );
      } else {
        // 超过重试次数，标记为失败
        await connection.execute(
          `UPDATE batch_tasks
           SET status = 'failed', error_message = ?, completed_at = NOW()
           WHERE id = ?`,
          [error.message, task.id]
        );

        await connection.execute(
          `UPDATE batch_queues
           SET failed_images = failed_images + 1
           WHERE id = ?`,
          [task.queue_id]
        );

        await this.checkQueueCompletion(task.queue_id, connection);
      }
    } finally {
      connection.release();
      this.activeWorkers--;
    }
  }

  /**
   * 创建批量编辑队列：基于用户已有作品进行图生图批量处理
   */
  async createBatchEditQueue(userId, imageIds, model, overridePrompt = '') {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 规范化 ID 列表
      const normalizedIds = Array.from(new Set((imageIds || [])
        .map((id) => parseInt(id, 10))
        .filter((id) => Number.isInteger(id) && id > 0)));

      if (normalizedIds.length === 0) {
        throw new Error('没有有效的作品 ID');
      }

      // 查询用户作品信息，确保只处理当前用户的作品
      const [creations] = await connection.execute(
        `SELECT id, image_url, prompt, model, folder_path
         FROM creations
         WHERE user_id = ? AND id IN (?)`,
        [userId, normalizedIds]
      );

      if (!Array.isArray(creations) || creations.length === 0) {
        throw new Error('未找到可批量编辑的作品');
      }

      // 统一队列级 folder_path 预览信息
      const uniqueFolderPaths = Array.from(new Set(
        creations
          .map((c) => (c.folder_path || '').trim())
          .filter((p) => p.length > 0)
      ));

      let queueFolderPath = null;
      if (uniqueFolderPaths.length === 1) {
        queueFolderPath = uniqueFolderPaths[0];
      } else if (uniqueFolderPaths.length > 1) {
        const preview = uniqueFolderPaths.slice(0, 3).join(', ');
        queueFolderPath = preview + (uniqueFolderPaths.length > 3 ? ' 等' : '');
      }

      const finalPromptForQueue = (overridePrompt && overridePrompt.trim())
        ? overridePrompt.trim()
        : '批量编辑 - 使用原图提示词';

      // 创建批量编辑队列记录
      const [queueResult] = await connection.execute(
        `INSERT INTO batch_queues (user_id, batch_name, prompt, model, total_images, completed_images, failed_images, status, folder_path, queue_type)
         VALUES (?, ?, ?, ?, ?, 0, 0, 'pending', ?, 'edit')`,
        [
          userId,
          `批量编辑_${Date.now()}`,
          finalPromptForQueue,
          model || null,
          creations.length,
          queueFolderPath
        ]
      );

      const queueId = queueResult.insertId;

      // 为每个作品创建任务记录
      for (const item of creations) {
        const originalUrl = item.image_url;
        const originalFilename = originalUrl
          ? String(originalUrl).split('/').filter(Boolean).pop()
          : `creation-${item.id}.png`;

        const effectivePrompt = (overridePrompt && overridePrompt.trim())
          ? overridePrompt.trim()
          : (item.prompt || '');

        await connection.execute(
          `INSERT INTO batch_tasks (queue_id, user_id, original_image_url, original_filename, folder_path, prompt, model, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
          [
            queueId,
            userId,
            originalUrl,
            originalFilename,
            item.folder_path || null,
            effectivePrompt,
            model || item.model || null
          ]
        );
      }

      await connection.commit();

      // 启动队列处理
      this.startProcessing();

      return { success: true, queueId };
    } catch (error) {
      await connection.rollback();
      console.error('❌ 创建批量编辑队列失败:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  }

  /**
   * 检查队列是否全部完成
   */
  async checkQueueCompletion(queueId, connection) {
    const [queue] = await connection.execute(
      `SELECT total_images, completed_images, failed_images FROM batch_queues WHERE id = ?`,
      [queueId]
    );

    if (queue.length > 0) {
      const { total_images, completed_images, failed_images } = queue[0];
      if (completed_images + failed_images >= total_images) {
        const finalStatus = failed_images === total_images ? 'failed' : 'completed';
        await connection.execute(
          `UPDATE batch_queues SET status = ?, completed_at = NOW() WHERE id = ?`,
          [finalStatus, queueId]
        );
        console.log(`✅ 队列 ${queueId} 已完成，状态: ${finalStatus}`);
      }
    }
  }

  /**
   * 获取队列状态
   */
  async getQueueStatus(queueId) {
    try {
      const [queue] = await pool.execute(
        `SELECT * FROM batch_queues WHERE id = ?`,
        [queueId]
      );

      if (queue.length === 0) {
        return { success: false, error: '队列不存在' };
      }

      const [tasks] = await pool.execute(
        `SELECT * FROM batch_tasks WHERE queue_id = ? ORDER BY created_at ASC`,
        [queueId]
      );

      return {
        success: true,
        queue: queue[0],
        tasks: tasks
      };
    } catch (error) {
      console.error('❌ 获取队列状态失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取用户的所有队列
   */
  async getUserQueues(userId, limit = 20) {
    try {
      const [queues] = await pool.execute(
        `SELECT * FROM batch_queues WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
        [userId, limit]
      );

      return { success: true, queues };
    } catch (error) {
      console.error('❌ 获取用户队列失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 取消队列
   */
  async cancelQueue(queueId, userId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 验证队列所有权
      const [queue] = await connection.execute(
        'SELECT * FROM batch_queues WHERE id = ? AND user_id = ?',
        [queueId, userId]
      );

      if (queue.length === 0) {
        throw new Error('队列不存在或无权限');
      }

      // 取消所有待处理的任务
      await connection.execute(
        `UPDATE batch_tasks SET status = 'failed', error_message = '用户取消' WHERE queue_id = ? AND status = 'pending'`,
        [queueId]
      );

      // 更新队列状态
      await connection.execute(
        `UPDATE batch_queues SET status = 'cancelled', completed_at = NOW() WHERE id = ?`,
        [queueId]
      );

      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      console.error('❌ 取消队列失败:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  }

  /**
   * 辅助函数：延迟
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 导出单例
const queueService = new QueueService();
module.exports = queueService;
