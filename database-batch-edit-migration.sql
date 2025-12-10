-- ========================================
-- Batch Edit Queue Type Migration
-- Adds queue_type column to batch_queues to distinguish normal batch and batch-edit queues
-- Idempotent using information_schema checks
-- ========================================

SET @db_name = DATABASE();

-- Add queue_type to batch_queues (if table exists and column missing)
SET @sql := IF (
  EXISTS (
    SELECT 1 FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'batch_queues'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'batch_queues' AND COLUMN_NAME = 'queue_type'
  ),
  'ALTER TABLE `batch_queues` ADD COLUMN `queue_type` enum(\'batch\',\'edit\') NOT NULL DEFAULT \'batch\' COMMENT \'队列类型: batch(批量图生图), edit(批量编辑)\' AFTER `model`; ',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

