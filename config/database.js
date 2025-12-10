// config/database.js

// 1. 引入正确的工具：mysql2/promise + 文件操作
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 2. 从 .env 文件读取 MySQL 的配置
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 3. 创建一个数据库连接池（可以让多人同时高效使用数据库）
const pool = mysql.createPool(dbConfig);

// 4. 定义一个连接函数，用来在程序启动时测试连接（带重试机制）
const connectDB = async (maxRetries = 10, retryDelay = 3000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const connection = await pool.getConnection();
      console.log('✅ MySQL数据库连接成功！');
      connection.release();
      return;
    } catch (error) {
      console.error(`❌ MySQL数据库连接失败 (尝试 ${attempt}/${maxRetries}):`, error.message);
      if (attempt < maxRetries) {
        console.log(`⏳ ${retryDelay / 1000} 秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        throw error;
      }
    }
  }
};

/**
 * 读取并执行 SQL 文件
 * @param {string} relativePath 相对于项目根目录的路径，例如 'database.sql'
 * @param {object} options 额外选项
 *  - replaceDatabaseName: 是否将 SQL 中的数据库名替换为当前 DB_NAME
 *  - ensureDatabase: 是否在执行前确保数据库存在并切换到该库
 */
const runSqlFile = async (relativePath, options = {}) => {
  const { replaceDatabaseName = false, ensureDatabase = false } = options;
  const dbName = dbConfig.database;
  const filePath = path.join(__dirname, '..', relativePath);

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ 数据库初始化脚本未找到: ${filePath}`);
    return;
  }

  let sql = fs.readFileSync(filePath, 'utf8');

  if (!dbName) {
    console.warn('⚠️ 未配置 DB_NAME，跳过数据库名替换和自动初始化。');
  }

  // 将脚本中的固定数据库名替换为当前配置的 DB_NAME（用于 database.sql）
  if (replaceDatabaseName && dbName) {
    sql = sql.replace(/CREATE DATABASE IF NOT EXISTS `[^`]+`/g, `CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    sql = sql.replace(/USE `[^`]+`;/g, `USE \`${dbName}\`;`);
  }

  // 当脚本中没有 USE 语句时，主动添加一段前缀，确保在目标库中执行（用于 database-batch.sql）
  if (ensureDatabase && dbName && !/USE\s+`[^`]+`;/i.test(sql)) {
    sql = `CREATE DATABASE IF NOT EXISTS \`${dbName}\`;\nUSE \`${dbName}\`;\n` + sql;
  }

  const connection = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    multipleStatements: true
  });

  try {
    await connection.query(sql);
    console.log(`✅ 数据库脚本执行完成: ${relativePath}`);
  } catch (error) {
    console.error(`❌ 执行数据库脚本失败 (${relativePath}):`, error.message);
    throw error;
  } finally {
    await connection.end();
  }
};

/**
 * 在应用启动时检查数据库结构：
 * - 如果核心表（users）不存在，则执行 database.sql 初始化基础表
 * - 始终执行一次 database-batch.sql（内部使用 IF NOT EXISTS，幂等）
 */
const ensureDatabaseInitialized = async () => {
  const dbName = dbConfig.database;

  if (!dbName) {
    console.warn('⚠️ 未配置 DB_NAME，跳过数据库自动初始化。');
    return;
  }

  try {
    const connection = await pool.getConnection();
    let usersTableExists = false;

    try {
      const [rows] = await connection.query(
        'SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?',
        [dbName, 'users']
      );
      usersTableExists = rows[0]?.count > 0;
    } finally {
      connection.release();
    }

    if (!usersTableExists) {
      console.log('⚠️ 检测到数据库尚未初始化（users 表不存在），正在执行 database.sql 进行基础初始化...');
      await runSqlFile('database.sql', {
        replaceDatabaseName: true,
        ensureDatabase: true
      });
    } else {
      console.log('✅ 检测到数据库已包含核心表（users），跳过基础初始化。');
    }

    // 无论是否已初始化基础表，都执行一次批量功能脚本（内部使用 IF NOT EXISTS，幂等）
    console.log('ℹ️ 正在检查并初始化批量图生图相关表（如有需要）...');
    await runSqlFile('database-batch.sql', {
      ensureDatabase: true
    });

    // 执行用户统计相关表初始化
    console.log('ℹ️ 正在初始化用户统计相关表（如有需要）...');
    await runSqlFile('database-statistics.sql', {
      ensureDatabase: true
    });

    // 初始化 AI 模型管理表（幂等）
    console.log('ℹ️ 正在初始化 AI 模型管理表（如有需要）...');
    await runSqlFile('database-model-management.sql', {
      ensureDatabase: true
    });

    // 应用批量任务文件夹层级相关迁移（幂等）
    console.log('ℹ️ 正在应用批量任务 folder_path 相关迁移（如有需要）...');
    await runSqlFile('database-folder-path-migration.sql', {
      ensureDatabase: true
    });

    // 应用批量编辑队列类型相关迁移（幂等）
    console.log('ℹ️ 正在应用批量编辑队列类型相关迁移（如有需要）...');
    await runSqlFile('database-batch-edit-migration.sql', {
      ensureDatabase: true
    });
  } catch (error) {
    console.error('❌ 数据库自动初始化过程失败:', error.message);
    throw error;
  }
};

// 5. 导出连接函数、初始化函数和连接池，让其他文件使用
module.exports = { connectDB, ensureDatabaseInitialized, pool };
