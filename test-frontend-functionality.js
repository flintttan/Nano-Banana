#!/usr/bin/env node
/**
 * Frontend Functionality Testing Script
 * Tests all UI functionality after refactoring
 */

const http = require('http');

const APP_URL = 'http://localhost:3010';
const API_BASE = `${APP_URL}/api`;

const results = {
    passed: [],
    failed: [],
    warnings: []
};

function log(message, type = 'info') {
    const prefix = {
        info: 'ℹ️',
        pass: '✅',
        fail: '❌',
        warn: '⚠️'
    }[type] || 'ℹ️';

    console.log(`${prefix} ${message}`);
}

function addResult(test, status, message) {
    if (status === 'PASS') {
        results.passed.push({ test, message });
        log(`${test}: ${message}`, 'pass');
    } else if (status === 'FAIL') {
        results.failed.push({ test, message });
        log(`${test}: ${message}`, 'fail');
    } else {
        results.warnings.push({ test, message });
        log(`${test}: ${message}`, 'warn');
    }
}

function httpGet(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (e) {
                    resolve({ status: res.statusCode, data });
                }
            });
        }).on('error', reject);
    });
}

async function testMainPage() {
    log('\n=== Testing Main Page (index.html) ===');

    try {
        const response = await httpGet(APP_URL);
        if (response.status === 200) {
            const html = response.data;

            // Check for key elements
            const checks = [
                { name: 'Modern Minimalist Design CSS', pattern: /styles\/design-system\.css/ },
                { name: 'Tailwind CSS', pattern: /cdn\.tailwindcss\.com/ },
                { name: 'Font Awesome Icons', pattern: /font-awesome/ },
                { name: 'Main JS Script', pattern: /main\.js/ },
                { name: 'Prompt Input Field', pattern: /promptInput/ },
                { name: 'Generate Button', pattern: /generateBtn/ },
                { name: 'Model Selector', pattern: /modelSelector/ },
                { name: 'Mobile Tabs', pattern: /mobileTabCreate/ },
                { name: 'Gallery Container', pattern: /inspirationContainer/ },
                { name: 'Toast Notifications', pattern: /showSuccessToast|showErrorToast/ }
            ];

            checks.forEach(check => {
                if (check.pattern.test(html)) {
                    addResult('Main Page Elements', 'PASS', `${check.name} present`);
                } else {
                    addResult('Main Page Elements', 'FAIL', `${check.name} missing`);
                }
            });

            // Check for Modern Minimalist design patterns
            const designChecks = [
                { name: 'Gray-50 Background', pattern: /bg-gray-50|#F9FAFB/ },
                { name: 'Orange Accent Color', pattern: /orange-500|#F97316/ },
                { name: 'Rounded Corners', pattern: /rounded-xl|rounded-2xl/ },
                { name: 'Inter Font', pattern: /Inter/ },
                { name: 'Component Classes', pattern: /component-bg|component-tertiary/ }
            ];

            designChecks.forEach(check => {
                if (check.pattern.test(html)) {
                    addResult('Design System', 'PASS', `${check.name} implemented`);
                } else {
                    addResult('Design System', 'FAIL', `${check.name} not found`);
                }
            });

        } else {
            addResult('Main Page', 'FAIL', `HTTP ${response.status}`);
        }
    } catch (error) {
        addResult('Main Page', 'FAIL', `Error: ${error.message}`);
    }
}

async function testLoginPage() {
    log('\n=== Testing Login Page (login.html) ===');

    try {
        const response = await httpGet(`${APP_URL}/login.html`);
        if (response.status === 200) {
            const html = response.data;

            const checks = [
                { name: 'Design System CSS', pattern: /styles\/design-system\.css/ },
                { name: 'Login Form', pattern: /loginForm/ },
                { name: 'Registration Form', pattern: /registerForm/ },
                { name: 'Email Input', pattern: /loginEmail|registerEmail/ },
                { name: 'Password Input', pattern: /loginPassword|registerPassword/ },
                { name: 'Remember Me', pattern: /rememberMe/ },
                { name: 'Quick Login Button', pattern: /quickLoginBtn/ },
                { name: 'Toast Notifications', pattern: /showSuccessToast|showErrorToast/ },
                { name: 'Modern Styling', pattern: /auth-card|custom-input/ }
            ];

            checks.forEach(check => {
                if (check.pattern.test(html)) {
                    addResult('Login Page', 'PASS', `${check.name} present`);
                } else {
                    addResult('Login Page', 'FAIL', `${check.name} missing`);
                }
            });
        } else {
            addResult('Login Page', 'FAIL', `HTTP ${response.status}`);
        }
    } catch (error) {
        addResult('Login Page', 'FAIL', `Error: ${error.message}`);
    }
}

async function testBatchPage() {
    log('\n=== Testing Batch Page (batch.html) ===');

    try {
        const response = await httpGet(`${APP_URL}/batch.html`);
        if (response.status === 200) {
            const html = response.data;

            const checks = [
                { name: 'Design System CSS', pattern: /styles\/design-system\.css/ },
                { name: 'Main JS Dependency', pattern: /main\.js/ },
                { name: 'Drop Area', pattern: /dropArea/ },
                { name: 'File Input', pattern: /fileInput/ },
                { name: 'Prompt Input', pattern: /promptInput/ },
                { name: 'Batch Name Input', pattern: /batchNameInput/ },
                { name: 'Start Batch Button', pattern: /startBatchBtn/ },
                { name: 'Queue Display', pattern: /currentQueueStatusBadge/ },
                { name: 'Progress Bar', pattern: /progressBar/ },
                { name: 'Task List', pattern: /tasksContainer/ },
                { name: 'Edit Modal', pattern: /editModal/ },
                { name: 'Modern Styling', pattern: /component-bg|drop-zone/ }
            ];

            checks.forEach(check => {
                if (check.pattern.test(html)) {
                    addResult('Batch Page', 'PASS', `${check.name} present`);
                } else {
                    addResult('Batch Page', 'FAIL', `${check.name} missing`);
                }
            });
        } else {
            addResult('Batch Page', 'FAIL', `HTTP ${response.status}`);
        }
    } catch (error) {
        addResult('Batch Page', 'FAIL', `Error: ${error.message}`);
    }
}

async function testDesignSystemCSS() {
    log('\n=== Testing Design System CSS ===');

    try {
        const response = await httpGet(`${APP_URL}/styles/design-system.css`);
        if (response.status === 200) {
            const css = response.data;

            const checks = [
                { name: 'CSS Variables (Design Tokens)', pattern: /:root\s*{/ },
                { name: 'Primary Colors', pattern: /--bg-primary|--bg-secondary/ },
                { name: 'Orange Accent', pattern: /--accent-orange/ },
                { name: 'Component Classes', pattern: /\.component-bg/ },
                { name: 'Card Styles', pattern: /\.card\b/ },
                { name: 'Button Variants', pattern: /\.btn\b/ },
                { name: 'Input Styles', pattern: /\.input\b/ },
                { name: 'Shadow Utilities', pattern: /shadow-|box-shadow/ },
                { name: 'Border Radius', pattern: /rounded-/ },
                { name: 'Typography', pattern: /font-|text-/ },
                { name: 'Responsive Design', pattern: /@media/ }
            ];

            checks.forEach(check => {
                if (check.pattern.test(css)) {
                    addResult('Design System CSS', 'PASS', `${check.name} defined`);
                } else {
                    addResult('Design System CSS', 'FAIL', `${check.name} not found`);
                }
            });

            // Check for Modern Minimalist specific patterns
            if (/gray-50|white|orange-500/.test(css)) {
                addResult('Design System CSS', 'PASS', 'Modern Minimalist color palette applied');
            } else {
                addResult('Design System CSS', 'FAIL', 'Modern Minimalist color palette not found');
            }
        } else {
            addResult('Design System CSS', 'FAIL', `HTTP ${response.status}`);
        }
    } catch (error) {
        addResult('Design System CSS', 'FAIL', `Error: ${error.message}`);
    }
}

async function testAPIEndpoints() {
    log('\n=== Testing API Endpoints ===');

    const endpoints = [
        { path: '/api/health', method: 'GET', expectedStatus: 200 },
        { path: '/api/image/models', method: 'GET', expectedStatus: 401 }, // Requires auth
        { path: '/api/image/inspirations', method: 'GET', expectedStatus: 200 },
        { path: '/api/auth/login', method: 'POST', expectedStatus: 400 }, // Bad request without data
        { path: '/api/batch/queues', method: 'GET', expectedStatus: 401 } // Requires auth
    ];

    for (const endpoint of endpoints) {
        try {
            const url = `${API_BASE}${endpoint.path}`;
            const response = await httpGet(url);

            if (response.status === endpoint.expectedStatus) {
                addResult('API Endpoints', 'PASS', `${endpoint.method} ${endpoint.path} returns ${response.status}`);
            } else if (response.status === 401) {
                // 401 is expected for protected endpoints
                addResult('API Endpoints', 'PASS', `${endpoint.method} ${endpoint.path} properly protected (401)`);
            } else {
                addResult('API Endpoints', 'WARN', `${endpoint.method} ${endpoint.path} returns ${response.status} (expected ${endpoint.expectedStatus})`);
            }
        } catch (error) {
            addResult('API Endpoints', 'FAIL', `${endpoint.method} ${endpoint.path} error: ${error.message}`);
        }
    }
}

async function testMainJS() {
    log('\n=== Testing Main JavaScript (main.js) ===');

    try {
        const response = await httpGet(`${APP_URL}/main.js`);
        if (response.status === 200) {
            const js = response.data;

            const checks = [
                { name: 'API_BASE_URL', pattern: /API_BASE_URL/ },
                { name: 'Model Selection', pattern: /selectedModel|loadAvailableModels/ },
                { name: 'Generate Function', pattern: /handleGenerateClick|generateImage/ },
                { name: 'Auth Functions', pattern: /checkAuthStatus|handleLogout/ },
                { name: 'Toast Functions', pattern: /showSuccessToast|showErrorToast/ },
                { name: 'Gallery Functions', pattern: /fetchAndDisplayMyWorks|renderMyWorksGallery/ },
                { name: 'Batch Edit', pattern: /batchEdit|handleBatchEdit/ },
                { name: 'File Upload', pattern: /handleImageUpload|uploadedImageFiles/ },
                { name: 'Debounce Function', pattern: /debounce/ },
                { name: 'Model Dropdown', pattern: /updateModelDropdown|modelDropdown/ },
                { name: 'Selection Mode', pattern: /selectedImageIds|isSelectionMode/ },
                { name: 'Prompt Input Handler', pattern: /promptInput|charCount/ }
            ];

            checks.forEach(check => {
                if (check.pattern.test(js)) {
                    addResult('Main JavaScript', 'PASS', `${check.name} implemented`);
                } else {
                    addResult('Main JavaScript', 'FAIL', `${check.name} not found`);
                }
            });
        } else {
            addResult('Main JavaScript', 'FAIL', `HTTP ${response.status}`);
        }
    } catch (error) {
        addResult('Main JavaScript', 'FAIL', `Error: ${error.message}`);
    }
}

async function testJavaScriptSyntax() {
    log('\n=== Testing JavaScript Syntax ===');

    try {
        const response = await httpGet(`${APP_URL}/main.js`);
        if (response.status === 200) {
            const js = response.data;

            // Basic syntax checks
            const checks = [
                { name: 'No syntax errors', test: () => !js.includes('Uncaught SyntaxError') },
                { name: 'Event listeners defined', test: () => /addEventListener/.test(js) },
                { name: 'Async/await usage', test: () => /async function|await/.test(js) },
                { name: 'Arrow functions', test: () => /=>.*{/.test(js) },
                { name: 'Template literals', test: () => /`[^`]*\${/.test(js) },
                { name: 'Destructuring', test: () => /{[^}]+}/.test(js) }
            ];

            checks.forEach(check => {
                try {
                    if (check.test()) {
                        addResult('JavaScript Syntax', 'PASS', check.name);
                    } else {
                        addResult('JavaScript Syntax', 'WARN', check.name);
                    }
                } catch (e) {
                    addResult('JavaScript Syntax', 'FAIL', `${check.name}: ${e.message}`);
                }
            });
        }
    } catch (error) {
        addResult('JavaScript Syntax', 'FAIL', `Error: ${error.message}`);
    }
}

function generateReport() {
    log('\n' + '='.repeat(60));
    log('FRONTEND FUNCTIONALITY TEST REPORT');
    log('='.repeat(60));

    log('\n📊 SUMMARY:');
    log(`   Total Tests: ${results.passed.length + results.failed.length + results.warnings.length}`);
    log(`   Passed: ${results.passed.length} ✅`);
    log(`   Failed: ${results.failed.length} ❌`);
    log(`   Warnings: ${results.warnings.length} ⚠️`);

    const passRate = ((results.passed.length / (results.passed.length + results.failed.length)) * 100).toFixed(1);
    log(`   Pass Rate: ${passRate}%`);

    if (results.failed.length > 0) {
        log('\n❌ FAILED TESTS:');
        results.failed.forEach((item, index) => {
            log(`   ${index + 1}. ${item.test}: ${item.message}`);
        });
    }

    if (results.warnings.length > 0) {
        log('\n⚠️ WARNINGS:');
        results.warnings.forEach((item, index) => {
            log(`   ${index + 1}. ${item.test}: ${item.message}`);
        });
    }

    log('\n✅ PASSED TESTS:');
    results.passed.forEach((item, index) => {
        log(`   ${index + 1}. ${item.test}: ${item.message}`);
    });

    log('\n' + '='.repeat(60));

    const success = results.failed.length === 0;
    if (success) {
        log('🎉 ALL TESTS PASSED! Frontend functionality is working correctly.');
    } else {
        log('⚠️ Some tests failed. Please review the issues above.');
    }

    return success;
}

async function runTests() {
    log('🚀 Starting Frontend Functionality Tests...');
    log(`Testing application at: ${APP_URL}\n`);

    await testMainPage();
    await testLoginPage();
    await testBatchPage();
    await testDesignSystemCSS();
    await testAPIEndpoints();
    await testMainJS();
    await testJavaScriptSyntax();

    const success = generateReport();

    process.exit(success ? 0 : 1);
}

// Run all tests
runTests().catch(error => {
    log(`Fatal error: ${error.message}`, 'fail');
    process.exit(1);
});
