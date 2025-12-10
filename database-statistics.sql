-- ========================================
-- User Statistics Tracking
-- Creates usage_statistics table for analytics
-- ========================================

-- Create usage_statistics table if not exists
CREATE TABLE IF NOT EXISTS `usage_statistics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT 'User ID (references users.id)',
  `date` date NOT NULL COMMENT 'Statistics date (YYYY-MM-DD)',
  `points_consumed` int(11) NOT NULL DEFAULT 0 COMMENT 'Total points consumed on this date',
  `points_earned` int(11) NOT NULL DEFAULT 0 COMMENT 'Total points earned on this date',
  `images_created` int(11) NOT NULL DEFAULT 0 COMMENT 'Total images created on this date',
  `checkins` int(11) NOT NULL DEFAULT 0 COMMENT 'Number of check-ins on this date',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation time',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_date` (`user_id`, `date`),
  KEY `idx_user_date` (`user_id`, `date`),
  KEY `idx_date` (`date`),
  CONSTRAINT `fk_usage_stats_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='User usage statistics tracking';

-- Create helper view for easy statistics queries
CREATE OR REPLACE VIEW `user_daily_stats` AS
SELECT
  `user_id`,
  `date`,
  `points_consumed`,
  `points_earned`,
  `images_created`,
  `checkins`,
  (`points_earned` - `points_consumed`) AS `net_points_change`,
  `created_at`,
  `updated_at`
FROM `usage_statistics`;
