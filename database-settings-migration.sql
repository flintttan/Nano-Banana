-- ========================================
-- Runtime System Settings Migration
-- Adds default configuration values to system_config table
-- ========================================

-- Ensure system_config table exists (from database-batch.sql)
CREATE TABLE IF NOT EXISTS `system_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) NOT NULL COMMENT 'Configuration key',
  `config_value` text NOT NULL COMMENT 'Configuration value',
  `description` varchar(255) DEFAULT NULL COMMENT 'Configuration description',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='System configuration table';

-- Insert default mail settings (from environment variables)
INSERT INTO `system_config` (`config_key`, `config_value`, `description`)
VALUES
  ('mail_host', 'smtp.qq.com', 'SMTP server address'),
  ('mail_port', '465', 'SMTP port'),
  ('mail_user', '', 'Sender email address'),
  ('mail_pass', '', 'Email authorization code'),
  ('mail_from', '', 'Sender display name and email (e.g., "Brand <email@example.com>")'),
  ('mail_brand_name', 'Nano Banana', 'Email brand name')
ON DUPLICATE KEY UPDATE
  `config_key` = VALUES(`config_key`);

-- Insert default AI settings (from environment variables)
INSERT INTO `system_config` (`config_key`, `config_value`, `description`)
VALUES
  ('ai_api_base_url', '', 'AI API base URL'),
  ('ai_api_key', '', 'AI API key'),
  ('ai_models', '[]', 'Available image generation models (JSON array)')
ON DUPLICATE KEY UPDATE
  `config_key` = VALUES(`config_key`);

-- Insert default system settings
INSERT INTO `system_config` (`config_key`, `config_value`, `description`)
VALUES
  ('system_site_name', 'Nano Banana', 'Site name'),
  ('system_frontend_url', '*', 'Frontend URL for CORS')
ON DUPLICATE KEY UPDATE
  `config_key` = VALUES(`config_key`);

-- Batch concurrency already exists from database-batch.sql
INSERT INTO `system_config` (`config_key`, `config_value`, `description`)
VALUES ('batch_concurrency', '3', 'Batch image generation concurrency')
ON DUPLICATE KEY UPDATE `config_value` = '3';

-- Insert default registration settings
INSERT INTO `system_config` (`config_key`, `config_value`, `description`)
VALUES
  ('registration_domain_whitelist', '[]', 'Allowed email domains for registration (JSON array, empty = all domains allowed)'),
  ('registration_initial_credits', '10', 'Initial credits for new registered users')
ON DUPLICATE KEY UPDATE
  `config_key` = VALUES(`config_key`);
