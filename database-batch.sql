-- ========================================
-- 批量图生图功能数据库表设计
-- ========================================

-- 1. 系统配置表（存储全局并发数等配置）
CREATE TABLE IF NOT EXISTS `system_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) NOT NULL COMMENT '配置键',
  `config_value` text NOT NULL COMMENT '配置值',
  `description` varchar(255) DEFAULT NULL COMMENT '配置说明',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 插入默认并发数配置
INSERT INTO `system_config` (`config_key`, `config_value`, `description`)
VALUES ('batch_concurrency', '3', '批量图生图全局并发数')
ON DUPLICATE KEY UPDATE `config_value` = '3';

-- 2. 预设提示词表
CREATE TABLE IF NOT EXISTS `preset_prompts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL COMMENT '提示词标题',
  `content` text NOT NULL COMMENT '提示词内容',
  `category` varchar(50) DEFAULT 'general' COMMENT '分类',
  `sort_order` int(11) DEFAULT '0' COMMENT '排序',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '是否启用',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预设提示词表';

-- 插入默认预设提示词
INSERT INTO `preset_prompts` (`title`, `content`, `category`, `sort_order`) VALUES
('高清增强', 'masterpiece, best quality, ultra detailed, 8k resolution', 'quality', 1),
('艺术风格', 'artistic style, vibrant colors, creative composition', 'style', 2),
('写实风格', 'photorealistic, detailed textures, natural lighting', 'style', 3),
('动漫风格', 'anime style, cel shading, vibrant colors', 'style', 4),
('水彩画风', 'watercolor painting, soft colors, artistic brush strokes', 'style', 5);

-- 3. 批量任务队列表
CREATE TABLE IF NOT EXISTS `batch_queues` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `batch_name` varchar(255) DEFAULT NULL COMMENT '批次名称',
  `prompt` text NOT NULL COMMENT '统一提示词',
  `model` varchar(100) DEFAULT NULL COMMENT '使用的模型',
  `total_images` int(11) NOT NULL DEFAULT '0' COMMENT '总图片数',
  `completed_images` int(11) NOT NULL DEFAULT '0' COMMENT '已完成数',
  `failed_images` int(11) NOT NULL DEFAULT '0' COMMENT '失败数',
  `status` enum('pending','processing','completed','failed','cancelled') DEFAULT 'pending' COMMENT '队列状态',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL COMMENT '完成时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='批量任务队列表';

-- 4. 批量任务明细表
CREATE TABLE IF NOT EXISTS `batch_tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `queue_id` int(11) NOT NULL COMMENT '队列ID',
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `original_image_url` varchar(500) NOT NULL COMMENT '原始图片URL',
  `original_filename` varchar(255) DEFAULT NULL COMMENT '原始文件名',
  `prompt` text NOT NULL COMMENT '提示词',
  `model` varchar(100) DEFAULT NULL COMMENT '模型',
  `generated_image_url` varchar(500) DEFAULT NULL COMMENT '生成的图片URL',
  `status` enum('pending','processing','completed','failed') DEFAULT 'pending' COMMENT '任务状态',
  `error_message` text DEFAULT NULL COMMENT '错误信息',
  `retry_count` int(11) DEFAULT '0' COMMENT '重试次数',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `started_at` timestamp NULL DEFAULT NULL COMMENT '开始处理时间',
  `completed_at` timestamp NULL DEFAULT NULL COMMENT '完成时间',
  PRIMARY KEY (`id`),
  KEY `idx_queue_id` (`queue_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  FOREIGN KEY (`queue_id`) REFERENCES `batch_queues` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='批量任务明细表';

-- 创建索引以优化查询性能（幂等操作）
SET @db_name = DATABASE();

-- 检查并创建 idx_batch_queue_status 索引
SET @sql := IF (
  NOT EXISTS (
    SELECT 1 FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'batch_queues' AND INDEX_NAME = 'idx_batch_queue_status'
  ),
  'CREATE INDEX idx_batch_queue_status ON batch_queues(status, created_at);',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并创建 idx_batch_task_queue_status 索引
SET @sql := IF (
  NOT EXISTS (
    SELECT 1 FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'batch_tasks' AND INDEX_NAME = 'idx_batch_task_queue_status'
  ),
  'CREATE INDEX idx_batch_task_queue_status ON batch_tasks(queue_id, status);',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
