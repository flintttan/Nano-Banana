# Runtime System Settings Management - Implementation Summary

## Overview
Implemented comprehensive runtime system settings management that allows administrators to update configuration values through REST API endpoints without requiring server restarts. Configuration changes are stored in the database and loaded dynamically by services.

## Implementation Details

### 1. API Endpoints (routes/admin.js)

#### Get All Settings
- **Endpoint**: `GET /api/admin/settings`
- **Description**: Retrieves all system settings grouped by category (mail, ai, system)
- **Response**:
```json
{
  "success": true,
  "data": {
    "mail": {
      "host": "smtp.qq.com",
      "port": "465",
      "user": "user@example.com",
      "brand_name": "Nano Banana"
    },
    "ai": {
      "api_base_url": "https://api.example.com",
      "api_key": "sk-xxx",
      "models": "[]"
    },
    "system": {
      "site_name": "My Site",
      "frontend_url": "*",
      "batch_concurrency": "3"
    }
  }
}
```

#### Update Mail Settings
- **Endpoint**: `POST /api/admin/settings/mail`
- **Description**: Updates mail/SMTP configuration settings
- **Request Body**:
```json
{
  "host": "smtp.example.com",
  "port": 465,
  "user": "user@example.com",
  "pass": "password",
  "from": "Brand Name <noreply@example.com>",
  "brand_name": "My Brand"
}
```

#### Update AI Settings
- **Endpoint**: `POST /api/admin/settings/ai`
- **Description**: Updates AI service configuration
- **Request Body**:
```json
{
  "api_base_url": "https://api.example.com",
  "api_key": "sk-xxx",
  "models": [{"id": "model1", "name": "Model 1"}]
}
```

#### Update System Settings
- **Endpoint**: `POST /api/admin/settings/system`
- **Description**: Updates system-wide settings
- **Request Body**:
```json
{
  "site_name": "My Site",
  "frontend_url": "http://localhost:8080",
  "batch_concurrency": 5
}
```

#### Get Specific Setting
- **Endpoint**: `GET /api/admin/settings/:key`
- **Description**: Retrieves a specific configuration value
- **Example**: `GET /api/admin/settings/mail_host`

### 2. Configuration Service (services/configService.js)

A centralized service for managing runtime configuration with:

- **Caching**: 60-second cache to reduce database queries
- **Fallback to Environment Variables**: Falls back to `.env` values if database config not available
- **Grouped Configuration**: Methods to get mail, AI, and system configurations
- **Database Integration**: Direct database operations for reading/writing settings

**Key Methods**:
- `get(key, fallbackEnvKey)` - Get single config value with caching
- `getMailConfig()` - Get all mail settings
- `getAIConfig()` - Get all AI settings
- `set(key, value, description)` - Set config value in database
- `clearCache(key)` - Clear cache for specific key or all keys

### 3. Updated Services

#### mailService.js
- Updated to use `configService.getMailConfig()` instead of direct environment variables
- Dynamically creates transporter with runtime configuration
- Configuration changes take effect immediately on next email send

#### aiService.js
- Updated to use `configService.getAIConfig()` for API base URL and key
- Updated `getAvailableModels()` to load from database config
- Falls back to environment variables if database config not available

### 4. Database Schema

#### system_config Table
```sql
CREATE TABLE `system_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) NOT NULL COMMENT 'Configuration key',
  `config_value` text NOT NULL COMMENT 'Configuration value',
  `description` varchar(255) DEFAULT NULL COMMENT 'Configuration description',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='System configuration table';
```

#### Migration Script
File: `database-settings-migration.sql`
- Ensures system_config table exists
- Inserts default configuration values
- Supports easy migration from environment variables

### 5. Configuration Categories

#### Mail Settings (mail_*)
- `mail_host` - SMTP server address
- `mail_port` - SMTP port (465, 587, etc.)
- `mail_user` - Sender email address
- `mail_pass` - Email authorization code
- `mail_from` - Sender display name and email
- `mail_brand_name` - Email brand name

#### AI Settings (ai_*)
- `ai_api_base_url` - AI API base URL
- `ai_api_key` - AI API key
- `ai_models` - Available models (JSON array)

#### System Settings (system_*)
- `system_site_name` - Site name
- `system_frontend_url` - Frontend URL for CORS
- `batch_concurrency` - Batch processing concurrency (1-10)

### 6. Testing

#### Test Script
File: `scripts/test-settings-api.sh`
- Automated testing of all settings endpoints
- Includes login, get all settings, update mail/ai/system settings
- Verifies settings are persisted and retrievable

**Usage**:
```bash
BASE_URL=http://localhost:3000 \
ADMIN_EMAIL=admin@example.com \
ADMIN_PASSWORD=password \
./scripts/test-settings-api.sh
```

### 7. Key Features

✅ **No Server Restart Required** - Configuration changes take effect immediately
✅ **Database Persistence** - Settings survive server restarts
✅ **Environment Variable Fallback** - Falls back to `.env` if database config missing
✅ **RESTful API** - Clean, REST-compliant endpoints
✅ **Admin Authentication** - All endpoints require admin JWT token
✅ **Validation** - Input validation (e.g., concurrency range 1-10)
✅ **Grouped Configuration** - Settings organized by category
✅ **Caching** - Reduces database queries with 60-second cache
✅ **Backward Compatible** - Works alongside existing batch_concurrency endpoint

### 8. Migration from Environment Variables

To migrate existing environment variables to database configuration:

1. Run the migration script:
```sql
source /path/to/database-settings-migration.sql
```

2. Update `.env` values in the admin panel or via API:
```bash
# Update mail settings
curl -X POST /api/admin/settings/mail \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"host": "smtp.qq.com", "port": 465, ...}'

# Update AI settings
curl -X POST /api/admin/settings/ai \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"api_base_url": "https://api-host", "api_key": "sk-xxx"}'
```

### 9. Integration with Task T4

Task T4 (Admin Panel UI) can now use these endpoints to:
- Display current settings in grouped sections (Mail, AI, System)
- Allow administrators to update settings through forms
- Save changes without requiring server restart
- Show real-time configuration status

## Files Modified/Created

### Modified
- `routes/admin.js` - Added settings API endpoints
- `services/mailService.js` - Updated to use configService
- `services/aiService.js` - Updated to use configService

### Created
- `services/configService.js` - New configuration service
- `database-settings-migration.sql` - Database migration script
- `scripts/test-settings-api.sh` - API testing script
- `docs/RUNTIME_SETTINGS_IMPLEMENTATION.md` - This documentation

## Usage Example

```javascript
// Get all settings
const response = await fetch('/api/admin/settings', {
  headers: { 'Authorization': 'Bearer ' + token }
});
const settings = await response.json();

// Update mail settings
await fetch('/api/admin/settings/mail', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    host: 'smtp.gmail.com',
    port: 587,
    user: 'admin@example.com',
    brand_name: 'My App'
  })
});

// Configuration now available to services
// Next email sent will use new settings
```

## Benefits

1. **Simplified Configuration Management** - No need to edit `.env` files
2. **Runtime Updates** - Change settings without restarting server
3. **Persistent Changes** - Configuration survives restarts
4. **Admin-Friendly** - Easy to use admin panel interface
5. **Flexible** - Can be extended for more settings
6. **Backward Compatible** - Works with existing code
7. **Tested** - Includes automated test script

## Future Enhancements

- Add UI in admin panel for settings management (Task T4)
- Add audit log for configuration changes
- Add validation rules for specific settings
- Add import/export functionality for settings
- Add settings templates/presets
- Add support for encrypted values (e.g., API keys)
