-- 为 user_api_config 表添加 is_active 字段
-- 支持启用/禁用用户 API 密钥功能

ALTER TABLE `user_api_config`
ADD COLUMN `is_active` tinyint(1) DEFAULT '1' COMMENT '是否启用' AFTER `usage_count`;

-- 为现有记录设置默认值
UPDATE `user_api_config` SET `is_active` = 1 WHERE `is_active` IS NULL;
