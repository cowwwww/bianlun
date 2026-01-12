#!/bin/bash

# 🚀 Authentication System Test Script
# This script will help you test the signup/login system

echo ""
echo "🔐 =========================================="
echo "   Authentication System Test"
echo "   =========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check PocketBase
echo -e "${BLUE}📊 Checking PocketBase status...${NC}"
if curl -s http://127.0.0.1:8090/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PocketBase is running on port 8090${NC}"
else
    echo -e "${RED}❌ PocketBase is NOT running${NC}"
    echo -e "${YELLOW}Starting PocketBase...${NC}"
    echo ""
    echo "Please run this command in a new terminal:"
    echo "  cd /Users/mac/Downloads/bianluns\(9.5:10\)/pocketbase"
    echo "  ./pocketbase serve"
    echo ""
    exit 1
fi

# Check Frontend
echo -e "${BLUE}📊 Checking Frontend status...${NC}"
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running on port 5173${NC}"
else
    echo -e "${RED}❌ Frontend is NOT running${NC}"
    echo -e "${YELLOW}Starting Frontend...${NC}"
    echo ""
    echo "Please run this command in a new terminal:"
    echo "  cd /Users/mac/Downloads/bianluns\(9.5:10\)/tournament-frontend"
    echo "  npm run dev"
    echo ""
    exit 1
fi

echo ""
echo -e "${GREEN}✅ All services are running!${NC}"
echo ""
echo "=========================================="
echo "🧪 Testing Options:"
echo "=========================================="
echo ""
echo "1. 🔧 Test Tool (Recommended)"
echo "   Open this file in your browser:"
echo -e "   ${BLUE}file:///Users/mac/Downloads/bianluns(9.5:10)/test-pocketbase-auth.html${NC}"
echo ""
echo "2. 🌐 Frontend App"
echo "   Signup: ${BLUE}http://localhost:5173/signup${NC}"
echo "   Login:  ${BLUE}http://localhost:5173/login${NC}"
echo ""
echo "3. 🔧 Admin Dashboard"
echo "   ${BLUE}http://127.0.0.1:8090/_/${NC}"
echo ""
echo "=========================================="
echo "📝 Test Credentials:"
echo "=========================================="
echo ""
echo "WeChat ID: testuser123"
echo "Name:      Test User"
echo "Password:  password123"
echo ""
echo "=========================================="
echo "📖 Quick Test Steps:"
echo "=========================================="
echo ""
echo "1. Open the test tool in your browser"
echo "2. Click '检查状态' to verify system"
echo "3. Fill in the signup form and click '注册新用户'"
echo "4. Try logging in with the same credentials"
echo "5. Check the operation logs at the bottom"
echo ""
echo -e "${GREEN}✨ Ready to test! Good luck!${NC}"
echo ""

# Open test tool automatically (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${YELLOW}🚀 Opening test tool in browser...${NC}"
    open "file:///Users/mac/Downloads/bianluns(9.5:10)/test-pocketbase-auth.html"
fi




