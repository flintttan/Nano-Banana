#!/bin/bash

# 批量图生图API测试脚本

echo "========================================="
echo "批量图生图API测试"
echo "========================================="
echo ""

# 配置
BASE_URL="http://localhost:3000"
ADMIN_EMAIL="925626799@qq.com"
ADMIN_PASSWORD="your_password_here"

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

echo "========================================="
echo "测试完成"
echo "========================================="
echo ""
echo "注意事项："
echo "1. 如果登录失败，请修改脚本中的 ADMIN_PASSWORD"
echo "2. 确保数据库表已创建（运行 database-batch.sql）"
echo "3. 确保服务器正在运行"
echo ""
echo "下一步："
echo "1. 测试前端批量上传功能"
echo "2. 测试队列处理"
echo "3. 测试图片编辑功能"
