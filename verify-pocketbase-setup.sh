#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   PocketBase 设置验证工具${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if PocketBase is running
echo -e "${YELLOW}检查 1: PocketBase 运行状态${NC}"
if curl -s http://127.0.0.1:8090/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PocketBase 正在运行${NC}"
    echo -e "   URL: http://127.0.0.1:8090"
else
    echo -e "${RED}❌ PocketBase 未运行${NC}"
    echo -e "   请启动 PocketBase:"
    echo -e "   ${BLUE}cd pocketbase && ./pocketbase serve${NC}"
    exit 1
fi
echo ""

# Check if users collection exists
echo -e "${YELLOW}检查 2: Users 集合${NC}"
USERS_CHECK=$(curl -s http://127.0.0.1:8090/api/collections/users/records 2>&1)
if [[ "$USERS_CHECK" == *"\"page\""* ]] || [[ "$USERS_CHECK" == *"\"items\""* ]]; then
    echo -e "${GREEN}✅ Users 集合存在${NC}"
elif [[ "$USERS_CHECK" == *"404"* ]]; then
    echo -e "${RED}❌ Users 集合不存在${NC}"
    echo -e "   请创建 Users 集合"
    exit 1
else
    echo -e "${YELLOW}⚠️  无法确定 Users 集合状态（可能被 API Rules 限制）${NC}"
    echo -e "   这是正常的，继续检查..."
fi
echo ""

# Try to create a test user (will fail if API Rules are wrong)
echo -e "${YELLOW}检查 3: API Rules - 测试用户注册${NC}"
TEST_WECHAT_ID="test_verify_$(date +%s)"
TEST_EMAIL="${TEST_WECHAT_ID}@wechat.user"
TEST_PASSWORD="test123456"
TEST_NAME="测试用户"

SIGNUP_RESULT=$(curl -s -X POST http://127.0.0.1:8090/api/collections/users/records \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$TEST_WECHAT_ID\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"passwordConfirm\": \"$TEST_PASSWORD\",
    \"full_name\": \"$TEST_NAME\",
    \"wechat_id\": \"$TEST_WECHAT_ID\"
  }" 2>&1)

if [[ "$SIGNUP_RESULT" == *"\"id\""* ]]; then
    echo -e "${GREEN}✅ API Rules 配置正确 - 可以注册用户${NC}"
    echo -e "   测试用户创建成功"
    
    # Extract user ID
    USER_ID=$(echo "$SIGNUP_RESULT" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    # Try to authenticate
    echo ""
    echo -e "${YELLOW}检查 4: 测试登录${NC}"
    AUTH_RESULT=$(curl -s -X POST http://127.0.0.1:8090/api/collections/users/auth-with-password \
      -H "Content-Type: application/json" \
      -d "{
        \"identity\": \"$TEST_WECHAT_ID\",
        \"password\": \"$TEST_PASSWORD\"
      }" 2>&1)
    
    if [[ "$AUTH_RESULT" == *"\"token\""* ]]; then
        echo -e "${GREEN}✅ 登录功能正常${NC}"
        echo -e "   认证令牌已生成"
    else
        echo -e "${RED}❌ 登录失败${NC}"
        echo -e "   响应: $AUTH_RESULT"
    fi
    
    # Clean up test user
    if [ -n "$USER_ID" ]; then
        echo ""
        echo -e "${YELLOW}清理测试数据...${NC}"
        # Note: This requires admin auth, so it might fail
        # The test user will remain in the database
        echo -e "${BLUE}ℹ️  测试用户已创建但无法自动删除${NC}"
        echo -e "   微信号: $TEST_WECHAT_ID"
        echo -e "   您可以在 PocketBase 管理后台手动删除"
    fi
    
elif [[ "$SIGNUP_RESULT" == *"403"* ]] || [[ "$SIGNUP_RESULT" == *"Only admins can perform this action"* ]]; then
    echo -e "${RED}❌ API Rules 配置错误 - 不允许注册${NC}"
    echo -e "   错误: 403 Forbidden"
    echo -e "   原因: Create 规则限制了用户注册"
    echo ""
    echo -e "${YELLOW}修复方法:${NC}"
    echo -e "   1. 打开 PocketBase 管理后台:"
    echo -e "      ${BLUE}http://127.0.0.1:8090/_/${NC}"
    echo -e "   2. 进入: Collections → users → API Rules"
    echo -e "   3. 将 ${GREEN}Create${NC} 规则设置为 ${GREEN}空${NC}（删除所有文本）"
    echo -e "   4. 点击 ${GREEN}Save changes${NC}"
    echo ""
    echo -e "${BLUE}或者打开详细修复指南:${NC}"
    echo -e "   ${BLUE}open fix-users-api-rules.html${NC}"
    exit 1
    
elif [[ "$SIGNUP_RESULT" == *"400"* ]]; then
    echo -e "${YELLOW}⚠️  注册失败 - 数据验证错误${NC}"
    echo -e "   错误: 400 Bad Request"
    echo -e "   可能原因: 字段验证失败或缺少必需字段"
    echo -e "   响应: $SIGNUP_RESULT"
    echo ""
    echo -e "${YELLOW}请检查:${NC}"
    echo -e "   1. Users 集合是否有以下字段:"
    echo -e "      - username (Text, Unique)"
    echo -e "      - email (Email, Unique)"
    echo -e "      - password (Password)"
    echo -e "      - full_name (Text, Optional)"
    echo -e "      - wechat_id (Text, Optional)"
    exit 1
else
    echo -e "${RED}❌ 注册失败 - 未知错误${NC}"
    echo -e "   响应: $SIGNUP_RESULT"
    exit 1
fi
echo ""

# Check frontend
echo -e "${YELLOW}检查 5: 前端应用${NC}"
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 前端应用正在运行${NC}"
    echo -e "   URL: http://localhost:5173"
else
    echo -e "${YELLOW}⚠️  前端应用未运行${NC}"
    echo -e "   启动前端:"
    echo -e "   ${BLUE}cd tournament-frontend && npm run dev${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ 验证完成！${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}您的 PocketBase 设置正确！${NC}"
echo ""
echo -e "${YELLOW}下一步:${NC}"
echo -e "   1. 打开前端应用: ${BLUE}http://localhost:5173/signup${NC}"
echo -e "   2. 尝试注册一个账号"
echo -e "   3. 使用新账号登录: ${BLUE}http://localhost:5173/login${NC}"
echo ""
echo -e "${YELLOW}有用的链接:${NC}"
echo -e "   • PocketBase 管理后台: ${BLUE}http://127.0.0.1:8090/_/${NC}"
echo -e "   • 前端应用: ${BLUE}http://localhost:5173${NC}"
echo -e "   • 测试工具: ${BLUE}open test-signup-after-fix.html${NC}"
echo ""

