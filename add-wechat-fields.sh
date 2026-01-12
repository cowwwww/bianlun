#!/bin/bash

echo "================================================"
echo "🔧 自动添加微信登录字段到 PocketBase"
echo "================================================"
echo ""

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 检查PocketBase是否运行
if ! curl -s http://127.0.0.1:8090/api/health > /dev/null 2>&1; then
    echo -e "${RED}❌ 错误: PocketBase 未运行！${NC}"
    echo ""
    echo "请先启动 PocketBase:"
    echo "  cd pocketbase"
    echo "  ./pocketbase serve"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ PocketBase 正在运行${NC}"
echo ""

# 检查migration文件是否存在
if [ ! -f "pocketbase/pb_migrations/1734000000_add_wechat_fields.js" ]; then
    echo -e "${RED}❌ 错误: Migration文件不存在${NC}"
    exit 1
fi

echo -e "${YELLOW}⏳ 重启 PocketBase 以应用 migrations...${NC}"
echo ""
echo "请按照以下步骤操作："
echo ""
echo "1️⃣  在运行 PocketBase 的终端按 ${YELLOW}Ctrl+C${NC} 停止"
echo ""
echo "2️⃣  重新运行: ${GREEN}./pocketbase serve${NC}"
echo ""
echo "3️⃣  PocketBase 会自动应用 migrations 并添加字段"
echo ""
echo "4️⃣  看到以下信息说明成功:"
echo "   ${GREEN}> Applying 1734000000_add_wechat_fields.js${NC}"
echo ""
echo "================================================"
echo ""
echo "或者，你可以手动在 Admin 界面添加字段："
echo "1. 打开: http://127.0.0.1:8090/_/"
echo "2. 点击 users 集合"
echo "3. 点击 Fields 标签"
echo "4. 添加字段:"
echo "   - wechatOpenid (Text, Unique ✅)"
echo "   - wechatUnionid (Text)"
echo "   - avatar (URL)"
echo "5. 保存"
echo ""




