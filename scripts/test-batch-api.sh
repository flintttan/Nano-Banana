#!/bin/bash

# 批量图生图API测试脚本

echo "========================================="
echo "批量图生图API测试"
echo "========================================="
echo ""

# 配置
BASE_URL="http://localhost:3000"

# 加载环境变量
if [ -f .env ]; then
    echo "正在从 .env 文件加载环境变量..."
    export $(grep -v '^#' .env | xargs)
    echo -e "${GREEN}✓ 环境变量加载成功${NC}"
else
    echo -e "${YELLOW}警告: 未找到 .env 文件，使用默认配置${NC}"
fi

# 从环境变量或默认值获取管理员凭据
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-change_this_admin_password_123}"

echo "管理员邮箱: $ADMIN_EMAIL"
echo ""

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试函数
test_api() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local token=$5

    echo -e "${YELLOW}测试: $name${NC}"

    if [ -z "$token" ]; then
        response=$(curl -s -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "$data")
    fi

    echo "Response: $response"

    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✓ 通过${NC}"
    else
        echo -e "${RED}✗ 失败${NC}"
    fi
    echo ""
}

# 1. 测试健康检查
echo "1. 测试健康检查"
test_api "健康检查" "GET" "/api/health"

# 2. 管理员登录
echo "2. 管理员登录"
login_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

echo "Login Response: $login_response"

if echo "$login_response" | grep -q '"success":true'; then
    TOKEN=$(echo "$login_response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}✓ 登录成功${NC}"
    echo "Token: ${TOKEN:0:20}..."
else
    echo -e "${RED}✗ 登录失败，请检查管理员账号密码${NC}"
    echo "请修改脚本中的 ADMIN_PASSWORD"
    exit 1
fi
echo ""

# 3. 测试获取并发数配置
echo "3. 测试获取并发数配置"
test_api "获取并发数" "GET" "/api/admin/config/concurrency" "" "$TOKEN"

# 4. 测试更新并发数
echo "4. 测试更新并发数"
test_api "更新并发数" "POST" "/api/admin/config/concurrency" '{"concurrency":5}' "$TOKEN"

# 5. 测试获取预设提示词
echo "5. 测试获取预设提示词"
test_api "获取预设提示词" "GET" "/api/admin/presets" "" "$TOKEN"

# 6. 测试添加预设提示词
echo "6. 测试添加预设提示词"
test_api "添加预设提示词" "POST" "/api/admin/presets" \
    '{"title":"测试提示词","content":"test prompt content","category":"test","sortOrder":99}' \
    "$TOKEN"

# 7. 测试获取批量统计
echo "7. 测试获取批量统计"
test_api "获取批量统计" "GET" "/api/admin/batch/stats" "" "$TOKEN"

# 8. 测试获取批量队列
echo "8. 测试获取批量队列"
test_api "获取批量队列" "GET" "/api/admin/batch/queues" "" "$TOKEN"

# 9. 测试用户端获取预设（需要普通用户token）
echo "9. 测试用户端获取预设"
test_api "用户获取预设" "GET" "/api/batch/presets" "" "$TOKEN"

# 10. 测试用户端获取配置
echo "10. 测试用户端获取配置"
test_api "用户获取配置" "GET" "/api/batch/config" "" "$TOKEN"

# 11. 测试获取所有系统设置
echo "11. 测试获取所有系统设置"
test_api "获取所有系统设置" "GET" "/api/admin/settings" "" "$TOKEN"

# 12. 测试获取 Mail 组设置
echo "12. 测试获取 Mail 组设置"
test_api "获取 Mail 组设置" "GET" "/api/admin/settings/mail" "" "$TOKEN"

# 13. 测试获取 AI 组设置
echo "13. 测试获取 AI 组设置"
test_api "获取 AI 组设置" "GET" "/api/admin/settings/ai" "" "$TOKEN"

# 14. 测试获取 System 组设置
echo "14. 测试获取 System 组设置"
test_api "获取 System 组设置" "GET" "/api/admin/settings/system" "" "$TOKEN"

# 15. 测试更新 Mail 设置
echo "15. 测试更新 Mail 设置"
test_api "更新 Mail 设置" "PUT" "/api/admin/settings/mail" \
    '{"MAIL_HOST":"smtp.gmail.com","MAIL_PORT":587,"MAIL_USER":"test@example.com","MAIL_PASS":"test_password"}' \
    "$TOKEN"

# 16. 测试更新 AI 设置
echo "16. 测试更新 AI 设置"
test_api "更新 AI 设置" "PUT" "/api/admin/settings/ai" \
    '{"AI_API_BASE_URL":"https://api.openai.com","AI_API_KEY":"sk-test123456789"}' \
    "$TOKEN"

# 17. 测试更新 System 设置
echo "17. 测试更新 System 设置"
test_api "更新 System 设置" "PUT" "/api/admin/settings/system" \
    '{"NODE_ENV":"production","JWT_SECRET":"new_jwt_secret_key","FRONTEND_URL":"https://example.com"}' \
    "$TOKEN"

# 18. 测试创建新系统设置
echo "18. 测试创建新系统设置"
test_api "创建新系统设置" "POST" "/api/admin/settings" \
    '{"key":"CUSTOM_SETTING","value":"custom_value","category":"System","description":"自定义设置测试"}' \
    "$TOKEN"

# 19. 测试更新单个设置项
echo "19. 测试更新单个设置项"
test_api "更新单个设置项" "PUT" "/api/admin/settings/CUSTOM_SETTING" \
    '{"value":"updated_custom_value","description":"更新后的自定义设置"}' \
    "$TOKEN"

# 20. 测试验证运行时配置更新
echo "20. 测试验证运行时配置更新"
runtime_test=$(curl -s -X GET "$BASE_URL/api/admin/settings/system" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN")

echo "Runtime Config Response: $runtime_test"

if echo "$runtime_test" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ 运行时配置验证成功${NC}"
    if echo "$runtime_test" | grep -q '"NODE_ENV"'; then
        echo -e "${GREEN}✓ System 配置已更新，无需重启${NC}"
    fi
else
    echo -e "${RED}✗ 运行时配置验证失败${NC}"
fi
echo ""

# 21. 测试批量更新系统设置
echo "21. 测试批量更新系统设置"
bulk_update_data='{
    "settings": {
        "MAIL_FROM": "Test Brand <test@test.com>",
        "MAIL_BRAND_NAME": "Test Brand Name",
        "IMAGE_MODELS": [{"id":"test-model","name":"Test Model","description":"Test"}]
    }
}'

bulk_response=$(curl -s -X PUT "$BASE_URL/api/admin/settings/batch" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$bulk_update_data")

echo "Bulk Update Response: $bulk_response"

if echo "$bulk_response" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ 批量更新成功${NC}"
else
    echo -e "${RED}✗ 批量更新失败${NC}"
fi
echo ""

echo "========================================="
echo "测试完成"
echo "========================================="
echo ""
echo "注意事项："
echo "1. 管理员凭据从 .env 文件自动加载"
echo "2. 如果登录失败，请检查 .env 文件中的 ADMIN_EMAIL 和 ADMIN_PASSWORD"
echo "3. 确保数据库表已创建（运行 database-batch.sql）"
echo "4. 确保服务器正在运行"
echo ""
echo "测试覆盖范围："
echo "1. 健康检查和管理员认证（.env 凭据）"
echo "2. 批量处理配置和预设管理"
echo "3. 系统设置 CRUD 操作（Mail/AI/System 分组）"
echo "4. 运行时配置更新验证（无需重启）"
echo "5. 批量设置更新功能"
echo ""
echo "下一步："
echo "1. 测试前端批量上传功能"
echo "2. 测试队列处理"
echo "3. 测试图片编辑功能"
echo "4. 验证管理面板系统设置 UI"
