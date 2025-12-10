-- ========================================
-- Folder Path Support Migration
-- Adds folder_path columns to batch_queues, batch_tasks, creations
-- Idempotent using information_schema checks
-- ========================================

SET @db_name = DATABASE();

-- Add folder_path to batch_queues (if table exists and column missing)
SET @sql := IF (
  EXISTS (
    SELECT 1 FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'batch_queues'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'batch_queues' AND COLUMN_NAME = 'folder_path'
  ),
  'ALTER TABLE `batch_queues` ADD COLUMN `folder_path` varchar(500) DEFAULT NULL COMMENT ''原始文件夹路径，用于前端分组'' AFTER `model`;',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add folder_path to batch_tasks (if table exists and column missing)
SET @sql := IF (
  EXISTS (
    SELECT 1 FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'batch_tasks'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'batch_tasks' AND COLUMN_NAME = 'folder_path'
  ),
  'ALTER TABLE `batch_tasks` ADD COLUMN `folder_path` varchar(500) DEFAULT NULL COMMENT ''原始文件夹路径，用于前端分组'' AFTER `original_filename`;',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add folder_path to creations (if table exists and column missing)
SET @sql := IF (
  EXISTS (
    SELECT 1 FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'creations'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'creations' AND COLUMN_NAME = 'folder_path'
  ),
  'ALTER TABLE `creations` ADD COLUMN `folder_path` varchar(500) DEFAULT NULL COMMENT ''原始文件夹路径（批量生成）'' AFTER `size`;',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

