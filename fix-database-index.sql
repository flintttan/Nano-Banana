-- ========================================
-- 数据库索引修复脚本
-- 用于解决 idx_batch_queue_status 重复索引错误
-- ========================================

SET @db_name = DATABASE();

-- 检查并删除重复的索引（如果存在）
SET @sql := IF (
  EXISTS (
    SELECT 1 FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'batch_queues' AND INDEX_NAME = 'idx_batch_queue_status'
  ),
  'DROP INDEX idx_batch_queue_status ON batch_queues;',
  'SELECT "idx_batch_queue_status does not exist"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 重新创建索引（幂等操作）
SET @sql := IF (
  NOT EXISTS (
    SELECT 1 FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'batch_queues' AND INDEX_NAME = 'idx_batch_queue_status'
  ),
  'CREATE INDEX idx_batch_queue_status ON batch_queues(status, created_at);',
  'SELECT "idx_batch_queue_status already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 验证索引是否创建成功
SELECT
  TABLE_NAME,
  INDEX_NAME,
  NON_UNIQUE,
  SEQ_IN_INDEX,
  COLUMN_NAME
FROM
  information_schema.STATISTICS
WHERE
  TABLE_SCHEMA = @db_name
  AND TABLE_NAME IN ('batch_queues', 'batch_tasks')
  AND INDEX_NAME IN ('idx_batch_queue_status', 'idx_batch_task_queue_status')
ORDER BY
  TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

SELECT '数据库索引修复完成！' AS status;
