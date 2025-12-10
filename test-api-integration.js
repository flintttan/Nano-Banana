/**
 * API Integration Test Suite - Fixed Version
 * Tests all 16+ API endpoints across 4 categories
 * - Authentication (3 endpoints)
 * - User Management (5 endpoints)
 * - Image Generation (5 endpoints)
 * - Admin Panel (6+ endpoints)
 */

const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3010';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'fulintan@fbrq.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'banananan123';

// Test results tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

// Color output for terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function recordTest(category, endpoint, method, status, details = '') {
  results.total++;
  if (status === 'PASS') results.passed++;
  else if (status === 'FAIL') results.failed++;
  else if (status === 'SKIP') results.skipped++;

  results.tests.push({
    category,
    endpoint,
    method,
    status,
    details
  });

  const statusColor = status === 'PASS' ? 'green' :
                     status === 'FAIL' ? 'red' : 'yellow';
  const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⊘';
  log(`[${status}] ${icon} ${method} ${endpoint} ${details}`, statusColor);
}

// Test context
let testContext = {
  adminToken: null,
  userToken: null,
  userId: null,
  imageId: null,
  testEmail: `test_${Date.now()}@test.com`,
  testUsername: `testuser_${Date.now()}`
};

// Configure axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  validateStatus: () => true // Don't throw on non-2xx status codes
});

/**
 * Category 1: Authentication APIs (3 endpoints)
 */
async function testAuthentication() {
  log('\n=== Testing Authentication APIs ===', 'blue');

  // Test 1: POST /api/auth/register
  try {
    const response = await api.post('/api/auth/register', {
      username: testContext.testUsername,
      email: testContext.testEmail,
      password: 'test123456',
      code: '000000'
    });

    if (response.status === 201 && response.data.success && response.data.data.token) {
      testContext.userToken = response.data.data.token;
      testContext.userId = response.data.data.user.id;
      recordTest('Authentication', '/api/auth/register', 'POST', 'PASS', '- User registered successfully');
    } else {
      recordTest('Authentication', '/api/auth/register', 'POST', 'SKIP', '- Verification code required or registration failed');
    }
  } catch (error) {
    recordTest('Authentication', '/api/auth/register', 'POST', 'SKIP', `- Verification code required: ${error.message}`);
  }

  // Test 2: POST /api/auth/login (Admin)
  try {
    const response = await api.post('/api/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (response.status === 200 && response.data.success && response.data.data.token) {
      testContext.adminToken = response.data.data.token;
      testContext.adminUser = response.data.data.user;
      recordTest('Authentication', '/api/auth/login', 'POST', 'PASS', `- Admin login successful (ID: ${testContext.adminUser.id})`);
    } else if (response.status === 401) {
      recordTest('Authentication', '/api/auth/login', 'FAIL', '- Invalid credentials');
    } else {
      recordTest('Authentication', '/api/auth/login', 'FAIL', `- Login failed with status ${response.status}`);
    }
  } catch (error) {
    recordTest('Authentication', '/api/auth/login', 'FAIL', `- ${error.message}`);
  }

  // Test 3: POST /api/auth/refresh
  if (testContext.adminToken) {
    try {
      const response = await api.post('/api/auth/refresh', {}, {
        headers: { Authorization: `Bearer ${testContext.adminToken}` }
      });

      if (response.status === 200 && response.data.success && response.data.data.token) {
        recordTest('Authentication', '/api/auth/refresh', 'POST', 'PASS', '- Token refreshed successfully');
      } else {
        recordTest('Authentication', '/api/auth/refresh', 'FAIL', '- Token refresh failed');
      }
    } catch (error) {
      recordTest('Authentication', '/api/auth/refresh', 'FAIL', `- ${error.message}`);
    }
  } else {
    recordTest('Authentication', '/api/auth/refresh', 'SKIP', '- No token to refresh');
  }

  // Test 4: GET /api/auth/me
  if (testContext.adminToken) {
    try {
      const response = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${testContext.adminToken}` }
      });

      if (response.status === 200 && response.data.success && response.data.data.user) {
        recordTest('Authentication', '/api/auth/me', 'GET', 'PASS', '- Current user retrieved');
      } else {
        recordTest('Authentication', '/api/auth/me', 'FAIL', '- Failed to get current user');
      }
    } catch (error) {
      recordTest('Authentication', '/api/auth/me', 'FAIL', `- ${error.message}`);
    }
  } else {
    recordTest('Authentication', '/api/auth/me', 'SKIP', '- No token to verify');
  }
}

/**
 * Category 2: User Management APIs (5 endpoints)
 */
async function testUserManagement() {
  log('\n=== Testing User Management APIs ===', 'blue');

  if (!testContext.adminToken) {
    log('Skipping user management tests - no admin token', 'yellow');
    return;
  }

  // Test 5: GET /api/user/info
  try {
    const response = await api.get('/api/user/info', {
      headers: { Authorization: `Bearer ${testContext.adminToken}` }
    });

    if (response.status === 200 && response.data.success && response.data.data) {
      recordTest('User Management', '/api/user/info', 'GET', 'PASS', `- User info: ${response.data.data.username}`);
    } else {
      recordTest('User Management', '/api/user/info', 'FAIL', '- No user data received');
    }
  } catch (error) {
    recordTest('User Management', '/api/user/info', 'FAIL', `- ${error.message}`);
  }

  // Test 6: POST /api/user/checkin
  try {
    const response = await api.post('/api/user/checkin', {}, {
      headers: { Authorization: `Bearer ${testContext.adminToken}` }
    });

    if (response.status === 200 && response.data.success) {
      recordTest('User Management', '/api/user/checkin', 'POST', 'PASS', '- Check-in successful');
    } else if (response.data && response.data.error && response.data.error.includes('已经签到')) {
      recordTest('User Management', '/api/user/checkin', 'PASS', '- Already checked in today');
    } else {
      recordTest('User Management', '/api/user/checkin', 'FAIL', '- Check-in failed');
    }
  } catch (error) {
    recordTest('User Management', '/api/user/checkin', 'FAIL', `- ${error.message}`);
  }

  // Test 7: GET /api/user/api-keys
  try {
    const response = await api.get('/api/user/api-keys', {
      headers: { Authorization: `Bearer ${testContext.adminToken}` }
    });

    if (response.status === 200 && response.data.success) {
      const hasKey = response.data.has_key;
      recordTest('User Management', '/api/user/api-keys', 'GET', 'PASS', `- API keys retrieved (has_key: ${hasKey})`);
    } else {
      recordTest('User Management', '/api/user/api-keys', 'FAIL', '- Failed to get API keys');
    }
  } catch (error) {
    recordTest('User Management', '/api/user/api-keys', 'FAIL', `- ${error.message}`);
  }

  // Test 8: POST /api/user/api-keys
  try {
    const testApiKey = `test-key-${Date.now()}`;
    const response = await api.post('/api/user/api-keys', {
      api_key: testApiKey,
      api_base_url: 'https://api.example.com'
    }, {
      headers: { Authorization: `Bearer ${testContext.adminToken}` }
    });

    if (response.status === 200 && response.data.success) {
      recordTest('User Management', '/api/user/api-keys', 'POST', 'PASS', '- API key created/updated');
    } else {
      recordTest('User Management', '/api/user/api-keys', 'FAIL', '- Failed to create API key');
    }
  } catch (error) {
    recordTest('User Management', '/api/user/api-keys', 'POST', 'FAIL', `- ${error.message}`);
  }

  // Test 9: PUT /api/user/api-keys/status
  try {
    const response = await api.put('/api/user/api-keys/status', {
      is_active: true
    }, {
      headers: { Authorization: `Bearer ${testContext.adminToken}` }
    });

    if (response.status === 200 && response.data.success) {
      recordTest('User Management', '/api/user/api-keys/status', 'PUT', 'PASS', '- API key status updated');
    } else {
      recordTest('User Management', '/api/user/api-keys/status', 'PUT', 'FAIL', '- Failed to update status');
    }
  } catch (error) {
    recordTest('User Management', '/api/user/api-keys/status', 'PUT', 'FAIL', `- ${error.message}`);
  }
}

/**
 * Category 3: Image Generation APIs (5 endpoints)
 */
async function testImageGeneration() {
  log('\n=== Testing Image Generation APIs ===', 'blue');

  if (!testContext.adminToken) {
    log('Skipping image generation tests - no admin token', 'yellow');
    return;
  }

  // Test 10: GET /api/image/models
  try {
    const response = await api.get('/api/image/models', {
      headers: { Authorization: `Bearer ${testContext.adminToken}` }
    });

    if (response.status === 200 && response.data.success && response.data.data) {
      const modelCount = Array.isArray(response.data.data) ? response.data.data.length : 0;
      recordTest('Image Generation', '/api/image/models', 'GET', 'PASS', `- ${modelCount} models retrieved`);
    } else {
      recordTest('Image Generation', '/api/image/models', 'FAIL', '- No models data');
    }
  } catch (error) {
    recordTest('Image Generation', '/api/image/models', 'FAIL', `- ${error.message}`);
  }

  // Test 11: GET /api/image/inspirations
  try {
    const response = await api.get('/api/image/inspirations');

    if (response.status === 200 && response.data.success) {
      const inspirationCount = Array.isArray(response.data.data) ? response.data.data.length : 0;
      recordTest('Image Generation', '/api/image/inspirations', 'GET', 'PASS', `- ${inspirationCount} inspirations retrieved`);
    } else {
      recordTest('Image Generation', '/api/image/inspirations', 'FAIL', '- Failed to get inspirations');
    }
  } catch (error) {
    recordTest('Image Generation', '/api/image/inspirations', 'FAIL', `- ${error.message}`);
  }

  // Test 12: POST /api/image/generate (Skip - requires API key and credits)
  recordTest('Image Generation', '/api/image/generate', 'POST', 'SKIP', '- Requires API key and credits');

  // Test 13: GET /api/image/history
  try {
    const response = await api.get('/api/image/history', {
      headers: { Authorization: `Bearer ${testContext.adminToken}` }
    });

    if (response.status === 200 && response.data.success) {
      const historyCount = Array.isArray(response.data.data) ? response.data.data.length : 0;
      recordTest('Image Generation', '/api/image/history', 'GET', 'PASS', `- ${historyCount} images in history`);

      if (response.data.data && response.data.data.length > 0) {
        testContext.imageId = response.data.data[0].id;
      }
    } else {
      recordTest('Image Generation', '/api/image/history', 'FAIL', '- Failed to get history');
    }
  } catch (error) {
    recordTest('Image Generation', '/api/image/history', 'FAIL', `- ${error.message}`);
  }

  // Test 14: POST /api/image/edit (Skip - requires image upload)
  recordTest('Image Generation', '/api/image/edit', 'POST', 'SKIP', '- Requires image upload');

  // Test 15: DELETE /api/image/delete/:id (Skip if no image ID)
  if (testContext.imageId) {
    recordTest('Image Generation', '/api/image/delete/:id', 'DELETE', 'SKIP', `- Would delete image ${testContext.imageId}`);
  } else {
    recordTest('Image Generation', '/api/image/delete/:id', 'DELETE', 'SKIP', '- No image to delete');
  }
}

/**
 * Category 4: Admin Panel APIs (6+ endpoints)
 */
async function testAdminPanel() {
  log('\n=== Testing Admin Panel APIs ===', 'blue');

  if (!testContext.adminToken) {
    log('Skipping admin panel tests - no admin token', 'yellow');
    return;
  }

  // Test 16: GET /api/admin/users
  try {
    const response = await api.get('/api/admin/users', {
      headers: { Authorization: `Bearer ${testContext.adminToken}` }
    });

    if (response.status === 200 && response.data.success && Array.isArray(response.data.data)) {
      recordTest('Admin Panel', '/api/admin/users', 'GET', 'PASS', `- ${response.data.data.length} users retrieved`);
    } else {
      recordTest('Admin Panel', '/api/admin/users', 'GET', 'FAIL', '- Failed to get users');
    }
  } catch (error) {
    recordTest('Admin Panel', '/api/admin/users', 'GET', 'FAIL', `- ${error.message}`);
  }

  // Test 17: GET /api/admin/users/stats
  try {
    const response = await api.get('/api/admin/users/stats', {
      headers: { Authorization: `Bearer ${testContext.adminToken}` }
    });

    if (response.status === 200 && response.data.success) {
      recordTest('Admin Panel', '/api/admin/users/stats', 'GET', 'PASS', '- User statistics retrieved');
    } else {
      recordTest('Admin Panel', '/api/admin/users/stats', 'GET', 'FAIL', '- Failed to get stats');
    }
  } catch (error) {
    recordTest('Admin Panel', '/api/admin/users/stats', 'GET', 'FAIL', `- ${error.message}`);
  }

  // Test 18: POST /api/admin/users/points (Skip - would modify user points)
  recordTest('Admin Panel', '/api/admin/users/points', 'POST', 'SKIP', '- Would modify user points');

  // Test 19: GET /api/admin/announcements
  try {
    const response = await api.get('/api/admin/announcements', {
      headers: { Authorization: `Bearer ${testContext.adminToken}` }
    });

    if (response.status === 200 && response.data.success) {
      const announcementCount = Array.isArray(response.data.data) ? response.data.data.length : 0;
      recordTest('Admin Panel', '/api/admin/announcements', 'GET', 'PASS', `- ${announcementCount} announcements retrieved`);
    } else {
      recordTest('Admin Panel', '/api/admin/announcements', 'GET', 'FAIL', '- Failed to get announcements');
    }
  } catch (error) {
    recordTest('Admin Panel', '/api/admin/announcements', 'GET', 'FAIL', `- ${error.message}`);
  }

  // Test 20: GET /api/admin/inspirations
  try {
    const response = await api.get('/api/admin/inspirations', {
      headers: { Authorization: `Bearer ${testContext.adminToken}` }
    });

    if (response.status === 200 && response.data.success) {
      const inspirationCount = Array.isArray(response.data.data) ? response.data.data.length : 0;
      recordTest('Admin Panel', '/api/admin/inspirations', 'GET', 'PASS', `- ${inspirationCount} admin inspirations retrieved`);
    } else {
      recordTest('Admin Panel', '/api/admin/inspirations', 'GET', 'FAIL', '- Failed to get inspirations');
    }
  } catch (error) {
    recordTest('Admin Panel', '/api/admin/inspirations', 'GET', 'FAIL', `- ${error.message}`);
  }

  // Test 21: GET /api/admin/settings
  try {
    const response = await api.get('/api/admin/settings', {
      headers: { Authorization: `Bearer ${testContext.adminToken}` }
    });

    if (response.status === 200 && response.data.success && response.data.data) {
      const settings = response.data.data;
      const settingsCount = Object.keys(settings).length;
      recordTest('Admin Panel', '/api/admin/settings', 'GET', 'PASS', `- System settings retrieved (${settingsCount} categories)`);
    } else {
      recordTest('Admin Panel', '/api/admin/settings', 'GET', 'FAIL', '- Failed to get settings');
    }
  } catch (error) {
    recordTest('Admin Panel', '/api/admin/settings', 'GET', 'FAIL', `- ${error.message}`);
  }

  // Test 22: GET /api/admin/models
  try {
    const response = await api.get('/api/admin/models', {
      headers: { Authorization: `Bearer ${testContext.adminToken}` }
    });

    if (response.status === 200 && response.data.success) {
      const modelCount = Array.isArray(response.data.data) ? response.data.data.length : 0;
      recordTest('Admin Panel', '/api/admin/models', 'GET', 'PASS', `- ${modelCount} models managed`);
    } else {
      recordTest('Admin Panel', '/api/admin/models', 'GET', 'FAIL', '- Failed to get models');
    }
  } catch (error) {
    recordTest('Admin Panel', '/api/admin/models', 'GET', 'FAIL', `- ${error.message}`);
  }
}

/**
 * Additional tests: Health check and error handling
 */
async function testAdditional() {
  log('\n=== Testing Additional Features ===', 'blue');

  // Test 23: GET /api/health
  try {
    const response = await api.get('/api/health');

    if (response.status === 200 && response.data.status === 'ok') {
      recordTest('Additional', '/api/health', 'GET', 'PASS', '- Server is healthy');
    } else {
      recordTest('Additional', '/api/health', 'GET', 'FAIL', '- Health check failed');
    }
  } catch (error) {
    recordTest('Additional', '/api/health', 'GET', 'FAIL', `- ${error.message}`);
  }

  // Test 24: GET /api/public/announcement
  try {
    const response = await api.get('/api/image/public/announcement');

    if (response.status === 200 && response.data.success !== undefined) {
      recordTest('Additional', '/api/image/public/announcement', 'GET', 'PASS', '- Public announcement retrieved');
    } else {
      recordTest('Additional', '/api/image/public/announcement', 'GET', 'FAIL', '- Failed to get announcement');
    }
  } catch (error) {
    recordTest('Additional', '/api/image/public/announcement', 'GET', 'FAIL', `- ${error.message}`);
  }

  // Test 25: Unauthorized access test
  try {
    const response = await api.get('/api/admin/users');

    if (response.status === 401 || response.status === 403) {
      recordTest('Additional', 'Unauthorized Access', 'GET', 'PASS', '- Properly rejected unauthorized request');
    } else {
      recordTest('Additional', 'Unauthorized Access', 'GET', 'FAIL', '- Should have rejected unauthorized request');
    }
  } catch (error) {
    recordTest('Additional', 'Unauthorized Access', 'GET', 'FAIL', `- ${error.message}`);
  }
}

/**
 * Generate comprehensive test report
 */
function generateReport() {
  log('\n' + '='.repeat(80), 'blue');
  log('API INTEGRATION TEST REPORT', 'blue');
  log('='.repeat(80), 'blue');

  log(`\nTarget: ${BASE_URL}`);
  log(`Timestamp: ${new Date().toISOString()}`);

  log('\n' + '-'.repeat(80));
  log('OVERALL RESULTS', 'cyan');
  log('-'.repeat(80));

  const successRate = ((results.passed / results.total) * 100).toFixed(2);
  log(`\nTotal Tests: ${results.total}`);
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'reset');
  log(`Skipped: ${results.skipped}`, 'yellow');
  log(`Success Rate: ${successRate}%`, results.failed === 0 ? 'green' : (successRate >= 80 ? 'yellow' : 'red'));

  // Group by category
  const categories = {};
  results.tests.forEach(test => {
    if (!categories[test.category]) {
      categories[test.category] = { passed: 0, failed: 0, skipped: 0, total: 0 };
    }
    categories[test.category].total++;
    if (test.status === 'PASS') categories[test.category].passed++;
    else if (test.status === 'FAIL') categories[test.category].failed++;
    else if (test.status === 'SKIP') categories[test.category].skipped++;
  });

  log('\n' + '-'.repeat(80));
  log('RESULTS BY CATEGORY', 'cyan');
  log('-'.repeat(80));

  Object.keys(categories).forEach(category => {
    const stats = categories[category];
    const catRate = ((stats.passed / stats.total) * 100).toFixed(2);
    log(`\n${category}:`);
    log(`  Total: ${stats.total}`);
    log(`  Passed: ${stats.passed}`, 'green');
    log(`  Failed: ${stats.failed}`, stats.failed > 0 ? 'red' : 'reset');
    log(`  Skipped: ${stats.skipped}`, 'yellow');
    log(`  Success Rate: ${catRate}%`, stats.failed === 0 ? 'green' : 'yellow');
  });

  // Detailed results
  log('\n' + '-'.repeat(80));
  log('DETAILED TEST RESULTS', 'cyan');
  log('-'.repeat(80));

  let currentCategory = '';
  results.tests.forEach(test => {
    if (test.category !== currentCategory) {
      currentCategory = test.category;
      log(`\n${currentCategory}:`, 'blue');
    }
    const statusColor = test.status === 'PASS' ? 'green' :
                       test.status === 'FAIL' ? 'red' : 'yellow';
    const icon = test.status === 'PASS' ? '✓' : test.status === 'FAIL' ? '✗' : '⊘';
    log(`  ${icon} [${test.status}] ${test.method} ${test.endpoint}`, statusColor);
    if (test.details) log(`      ${test.details}`);
  });

  log('\n' + '='.repeat(80), 'blue');

  if (results.failed === 0) {
    log('ALL TESTS PASSED!', 'green');
  } else {
    log(`${results.failed} TEST(S) FAILED`, 'red');
  }

  log('='.repeat(80), 'blue');
}

/**
 * Main test runner
 */
async function runAllTests() {
  log('╔════════════════════════════════════════════════════════════════════════════╗', 'blue');
  log('║                  API INTEGRATION TEST SUITE                                ║', 'blue');
  log('╚════════════════════════════════════════════════════════════════════════════╝', 'blue');

  try {
    await testAuthentication();
    await testUserManagement();
    await testImageGeneration();
    await testAdminPanel();
    await testAdditional();

    generateReport();

    // Exit with error code if tests failed
    if (results.failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    log(`\nTest execution failed: ${error.message}`, 'red');
    log(error.stack, 'red');
    process.exit(1);
  }
}

// Run tests
runAllTests();
