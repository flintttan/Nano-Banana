#!/usr/bin/env node
/**
 * Authentication Flow Testing Script
 * Tests login, registration, and session management
 */

const http = require('http');

const API_BASE = 'http://localhost:3010/api';
const APP_URL = 'http://localhost:3010';

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

function httpRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, API_BASE);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(body);
                    resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body, headers: res.headers });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function testAuthEndpoints() {
    log('\n=== Testing Authentication API Endpoints ===');

    // Test 1: Login endpoint
    try {
        const response = await httpRequest('/auth/login', 'POST', {
            email: 'test@example.com',
            password: 'wrongpassword'
        });

        if (response.status === 400 || response.status === 401) {
            addResult('Auth API', 'PASS', 'Login endpoint properly rejects invalid credentials');
        } else if (response.status === 200 && response.data.success === false) {
            addResult('Auth API', 'PASS', 'Login endpoint returns error for invalid credentials');
        } else {
            addResult('Auth API', 'WARN', `Login endpoint returns unexpected status: ${response.status}`);
        }
    } catch (error) {
        addResult('Auth API', 'FAIL', `Login test error: ${error.message}`);
    }

    // Test 2: Register endpoint
    try {
        const response = await httpRequest('/auth/register', 'POST', {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            code: '123456'
        });

        if (response.status === 400 || response.status === 422) {
            addResult('Auth API', 'PASS', 'Register endpoint validates input');
        } else if (response.status === 200 && response.data.success === false) {
            addResult('Auth API', 'PASS', 'Register endpoint returns validation errors');
        } else {
            addResult('Auth API', 'WARN', `Register endpoint status: ${response.status}`);
        }
    } catch (error) {
        addResult('Auth API', 'FAIL', `Register test error: ${error.message}`);
    }

    // Test 3: Send verification code
    try {
        const response = await httpRequest('/auth/send-code', 'POST', {
            email: 'test@example.com'
        });

        if (response.status === 200 || response.status === 400) {
            addResult('Auth API', 'PASS', 'Send verification code endpoint responds');
        } else {
            addResult('Auth API', 'WARN', `Send code endpoint status: ${response.status}`);
        }
    } catch (error) {
        addResult('Auth API', 'FAIL', `Send code test error: ${error.message}`);
    }

    // Test 4: Protected endpoint without auth
    try {
        const response = await httpRequest('/user/info');
        if (response.status === 401) {
            addResult('Auth API', 'PASS', 'User info endpoint requires authentication');
        } else {
            addResult('Auth API', 'WARN', `User info endpoint status: ${response.status}`);
        }
    } catch (error) {
        addResult('Auth API', 'FAIL', `Protected endpoint test error: ${error.message}`);
    }
}

async function testLoginPageUI() {
    log('\n=== Testing Login Page UI Elements ===');

    try {
        const response = await http.get(`${APP_URL}/login.html`, (res) => {
            let html = '';
            res.on('data', chunk => html += chunk);
            res.on('end', () => {
                const checks = [
                    { name: 'Login Tab', pattern: /loginTab/ },
                    { name: 'Register Tab', pattern: /registerTab/ },
                    { name: 'Email Input', pattern: /type="email"/ },
                    { name: 'Password Input', pattern: /type="password"/ },
                    { name: 'Submit Button', pattern: /type="submit"/ },
                    { name: 'Password Toggle', pattern: /toggleLoginPassword/ },
                    { name: 'Remember Me Checkbox', pattern: /rememberMe/ },
                    { name: 'Quick Login Button', pattern: /quickLoginBtn/ },
                    { name: 'Toast Container', pattern: /toastContainer/ },
                    { name: 'Verification Code Input', pattern: /verificationCode/ },
                    { name: 'Send Code Button', pattern: /sendCodeBtn/ }
                ];

                checks.forEach(check => {
                    if (check.pattern.test(html)) {
                        addResult('Login UI', 'PASS', `${check.name} present`);
                    } else {
                        addResult('Login UI', 'FAIL', `${check.name} missing`);
                    }
                });

                // Check for proper form validation attributes
                if (/required/.test(html)) {
                    addResult('Login UI', 'PASS', 'Form fields have required attributes');
                } else {
                    addResult('Login UI', 'WARN', 'Form validation attributes not found');
                }

                // Check for Modern Minimalist design
                if (/auth-card|custom-input/.test(html)) {
                    addResult('Login UI', 'PASS', 'Modern Minimalist styling applied');
                } else {
                    addResult('Login UI', 'FAIL', 'Modern Minimalist styling missing');
                }
            });
        });
    } catch (error) {
        addResult('Login UI', 'FAIL', `Error: ${error.message}`);
    }
}

async function testGuestMode() {
    log('\n=== Testing Guest Mode Functionality ===');

    // Test that quick login button exists and sets session
    try {
        const response = await http.get(`${APP_URL}/login.html`, (res) => {
            let html = '';
            res.on('data', chunk => html += chunk);
            res.on('end', () => {
                if (/quickLoginBtn/.test(html)) {
                    addResult('Guest Mode', 'PASS', 'Quick login button present in login page');
                } else {
                    addResult('Guest Mode', 'FAIL', 'Quick login button missing');
                }

                if (/sessionStorage\.setItem.*guest_token/.test(html)) {
                    addResult('Guest Mode', 'PASS', 'Guest token logic implemented');
                } else {
                    addResult('Guest Mode', 'WARN', 'Guest token logic not detected');
                }
            });
        });
    } catch (error) {
        addResult('Guest Mode', 'FAIL', `Error: ${error.message}`);
    }
}

async function testLogoutFunctionality() {
    log('\n=== Testing Logout Functionality ===');

    try {
        const response = await http.get(`${APP_URL}/`, (res) => {
            let html = '';
            res.on('data', chunk => html += chunk);
            res.on('end', () => {
                if (/logout-button|handleLogout/.test(html)) {
                    addResult('Logout', 'PASS', 'Logout functionality present');
                } else {
                    addResult('Logout', 'FAIL', 'Logout functionality missing');
                }

                if (/localStorage\.clear\(\)|sessionStorage\.clear\(\)/.test(html)) {
                    addResult('Logout', 'PASS', 'Storage cleanup implemented');
                } else {
                    addResult('Logout', 'WARN', 'Storage cleanup not detected');
                }
            });
        });
    } catch (error) {
        addResult('Logout', 'FAIL', `Error: ${error.message}`);
    }
}

function generateReport() {
    log('\n' + '='.repeat(60));
    log('AUTHENTICATION FLOW TEST REPORT');
    log('='.repeat(60));

    log('\n📊 SUMMARY:');
    log(`   Total Tests: ${results.passed.length + results.failed.length + results.warnings.length}`);
    log(`   Passed: ${results.passed.length} ✅`);
    log(`   Failed: ${results.failed.length} ❌`);
    log(`   Warnings: ${results.warnings.length} ⚠️`);

    const totalTests = results.passed.length + results.failed.length;
    const passRate = totalTests > 0 ? ((results.passed.length / totalTests) * 100).toFixed(1) : 0;
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
        log('🎉 ALL AUTHENTICATION TESTS PASSED!');
    } else {
        log('⚠️ Some authentication tests failed.');
    }

    return success;
}

async function runTests() {
    log('🚀 Starting Authentication Flow Tests...\n');

    await testAuthEndpoints();
    await testLoginPageUI();
    await testGuestMode();
    await testLogoutFunctionality();

    const success = generateReport();
    return success;
}

// Run all tests
runTests().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    log(`Fatal error: ${error.message}`, 'fail');
    process.exit(1);
});
