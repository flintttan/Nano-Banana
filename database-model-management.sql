-- ========================================
-- AI Model Management Table
-- Stores available image generation models and their enable status
-- ========================================

CREATE TABLE IF NOT EXISTS `model_management` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `model_key` varchar(100) NOT NULL COMMENT '模型唯一ID，用于 API 调用',
  `name` varchar(255) NOT NULL COMMENT '模型展示名称',
  `description` text DEFAULT NULL COMMENT '模型描述',
  `icon` varchar(50) DEFAULT NULL COMMENT '模型图标 Emoji 或短文本',
  `is_enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否在前台可见/可用',
  `credit_cost` int(11) NOT NULL DEFAULT '1' COMMENT '单次调用消耗积分',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_model_key` (`model_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI 模型管理表';

-- Seed default models (idempotent)
INSERT INTO `model_management` (`model_key`, `name`, `description`, `icon`, `is_enabled`, `credit_cost`)
VALUES
  ('gemini-2.5-flash-image', 'Gemini 2.5 Flash Image', '默认生图模型，基于 /v1/chat/completions 接口，生成速度快', '🪐', 1, 1),
  ('nano-banana', 'Nano Banana', '标准模式，生成速度快，适合日常使用', '🍌', 1, 1),
  ('nano-banana-hd', 'Nano Banana HD', '高清模式，增强画质细节', '✨', 1, 1),
  ('nano-banana-2', 'Nano Banana 2.0', '最新一代大模型，极致画质 (支持比例选择)', '🚀', 1, 1),
  ('nano-banana-2-2k', 'Nano Banana 2.0 (2K)', '2K 模式，超清分辨率绘图', '🔷', 1, 1),
  ('nano-banana-2-4k', 'Nano Banana 2.0 (4K)', '4K 模式，极致细节视觉盛宴', '💠', 1, 1)
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `description` = VALUES(`description`),
  `icon` = VALUES(`icon`);

