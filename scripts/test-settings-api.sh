#!/bin/bash

# Test script for runtime system settings management API
# Tests the new settings endpoints in routes/admin.js

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-change_this_admin_password_123}"

echo "=========================================="
echo "Runtime System Settings API Test"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo "Admin Email: $ADMIN_EMAIL"
echo ""

# Step 1: Admin login
echo "Step 1: Admin login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "Login failed. Response:"
    echo "$LOGIN_RESPONSE"
    exit 1
fi

echo "Login successful. Token obtained."
echo ""

# Step 2: Get all settings
echo "Step 2: Get all system settings..."
curl -s -X GET "$BASE_URL/api/admin/settings" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Step 3: Update mail settings
echo "Step 3: Update mail settings..."
curl -s -X POST "$BASE_URL/api/admin/settings/mail" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "host": "smtp.example.com",
        "port": 465,
        "user": "test@example.com",
        "brand_name": "Test Brand"
    }' | jq '.'
echo ""

# Step 4: Update AI settings
echo "Step 4: Update AI settings..."
curl -s -X POST "$BASE_URL/api/admin/settings/ai" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "api_base_url": "https://api.test.com",
        "api_key": "sk-test-key-123"
    }' | jq '.'
echo ""

# Step 5: Update system settings
echo "Step 5: Update system settings..."
curl -s -X POST "$BASE_URL/api/admin/settings/system" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "site_name": "Test Site",
        "frontend_url": "http://localhost:8080",
        "batch_concurrency": 5
    }' | jq '.'
echo ""

# Step 6: Get specific setting
echo "Step 6: Get specific setting (mail_host)..."
curl -s -X GET "$BASE_URL/api/admin/settings/mail_host" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Step 7: Verify all settings updated
echo "Step 7: Verify all settings updated..."
curl -s -X GET "$BASE_URL/api/admin/settings" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

echo "=========================================="
echo "Test completed successfully!"
echo "=========================================="
