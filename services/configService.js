// services/configService.js
// Runtime configuration service that loads settings from database
// Falls back to environment variables if database config not available

const { pool } = require('../config/database');

class ConfigService {
  constructor() {
    this.cache = {};
    this.cacheExpiry = {};
    this.cacheTTL = 60000; // Cache for 60 seconds
  }

  // Get configuration value with caching
  async get(key, fallbackEnvKey = null) {
    // Check cache first
    if (this.cache[key] && this.cacheExpiry[key] > Date.now()) {
      return this.cache[key];
    }

    try {
      const [rows] = await pool.execute(
        'SELECT config_value FROM system_config WHERE config_key = ?',
        [key]
      );

      if (rows.length > 0) {
        const value = rows[0].config_value;
        this.cache[key] = value;
        this.cacheExpiry[key] = Date.now() + this.cacheTTL;
        return value;
      }
    } catch (error) {
      console.error(`Failed to load config ${key} from database:`, error.message);
    }

    // Fallback to environment variable
    if (fallbackEnvKey && process.env[fallbackEnvKey]) {
      return process.env[fallbackEnvKey];
    }

    return null;
  }

  // Get all settings grouped by category
  async getAll() {
    try {
      const [rows] = await pool.execute('SELECT config_key, config_value FROM system_config');

      const settings = {
        mail: {},
        ai: {},
        system: {}
      };

      rows.forEach(row => {
        const key = row.config_key;
        const value = row.config_value;

        if (key.startsWith('mail_')) {
          settings.mail[key.replace('mail_', '')] = value;
        } else if (key.startsWith('ai_')) {
          settings.ai[key.replace('ai_', '')] = value;
        } else if (key.startsWith('system_')) {
          settings.system[key.replace('system_', '')] = value;
        } else if (key === 'batch_concurrency') {
          settings.system.batch_concurrency = value;
        }
      });

      return settings;
    } catch (error) {
      console.error('Failed to load all settings:', error.message);
      return { mail: {}, ai: {}, system: {} };
    }
  }

  // Get mail configuration
  async getMailConfig() {
    const config = {
      host: await this.get('mail_host', 'MAIL_HOST') || process.env.MAIL_HOST,
      port: parseInt(await this.get('mail_port', 'MAIL_PORT') || process.env.MAIL_PORT || '465'),
      user: await this.get('mail_user', 'MAIL_USER') || process.env.MAIL_USER,
      pass: await this.get('mail_pass', 'MAIL_PASS') || process.env.MAIL_PASS,
      from: await this.get('mail_from', 'MAIL_FROM') || process.env.MAIL_FROM,
      brandName: await this.get('mail_brand_name', 'MAIL_BRAND_NAME') || process.env.MAIL_BRAND_NAME || 'Nano Banana'
    };

    return config;
  }

  // Get AI configuration
  async getAIConfig() {
    const config = {
      apiBaseUrl: await this.get('ai_api_base_url', 'AI_API_BASE_URL') || process.env.AI_API_BASE_URL,
      apiKey: await this.get('ai_api_key', 'AI_API_KEY') || process.env.AI_API_KEY,
      models: await this.get('ai_models', 'IMAGE_MODELS') || process.env.IMAGE_MODELS
    };

    return config;
  }

  // Get enabled image models from dedicated model_management table
  // Falls back to null if table is unavailable; callers should handle fallback models
  async getEnabledModels() {
    const cacheKey = 'enabled_models';

    // Check cache first
    if (this.cache[cacheKey] && this.cacheExpiry[cacheKey] > Date.now()) {
      return this.cache[cacheKey];
    }

    try {
      const [rows] = await pool.execute(
        'SELECT model_key, name, description, icon, credit_cost FROM model_management WHERE is_enabled = 1 ORDER BY id ASC'
      );

      const models = rows.map(row => ({
        id: row.model_key || row.name,
        name: row.name || row.model_key,
        description: row.description || '',
        icon: row.icon || '✨',
        creditCost: row.credit_cost !== null && row.credit_cost !== undefined
          ? parseInt(row.credit_cost, 10)
          : null
      }));

      this.cache[cacheKey] = models;
      this.cacheExpiry[cacheKey] = Date.now() + this.cacheTTL;

      return models;
    } catch (error) {
      console.error('Failed to load enabled models from model_management:', error.message);
      return null;
    }
  }

  // Get registration configuration
  async getRegistrationConfig() {
    const domainWhitelistStr = await this.get('registration_domain_whitelist') || '[]';
    let domainWhitelist = [];

    try {
      domainWhitelist = JSON.parse(domainWhitelistStr);
      if (!Array.isArray(domainWhitelist)) {
        console.warn('Invalid domain whitelist format, using empty array');
        domainWhitelist = [];
      }
    } catch (error) {
      console.warn('Failed to parse domain whitelist, using empty array:', error.message);
      domainWhitelist = [];
    }

    // 优先使用环境变量，其次使用数据库配置，最后回退到默认值 10
    const defaultPoints = parseInt(process.env.DEFAULT_USER_POINTS) || 10;
    const initialCredits = parseInt(await this.get('registration_initial_credits') || defaultPoints);

    const config = {
      domainWhitelist: domainWhitelist,
      initialCredits: initialCredits
    };

    return config;
  }

  // Clear cache for specific key or all keys
  clearCache(key = null) {
    if (key) {
      delete this.cache[key];
      delete this.cacheExpiry[key];
    } else {
      this.cache = {};
      this.cacheExpiry = {};
    }
  }

  // Set configuration value
  async set(key, value, description = '') {
    try {
      await pool.execute(
        'INSERT INTO system_config (config_key, config_value, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE config_value = ?, description = ?',
        [key, value, description, value, description]
      );

      // Clear cache for this key
      this.clearCache(key);

      return true;
    } catch (error) {
      console.error(`Failed to set config ${key}:`, error.message);
      return false;
    }
  }
}

module.exports = new ConfigService();
