#!/bin/bash

echo "================================================"
echo "🔄 重启 PocketBase 并应用所有配置"
echo "================================================"
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}📋 准备应用的配置：${NC}"
echo "✅ 创建 tournaments 集合（赛事）"
echo "✅ 创建 topics 集合（辩题）"
echo "✅ 创建 timer_projects 集合（计时器）"
echo "✅ 更新 users 集合（添加微信字段）"
echo "✅ 配置微信登录（wechat_auth.pb.js）"
echo ""

echo -e "${RED}⚠️  重要步骤：${NC}"
echo ""
echo "1️⃣  在运行 PocketBase 的终端按 ${RED}Ctrl+C${NC} 停止它"
echo ""
echo "2️⃣  然后运行："
echo "   ${GREEN}cd pocketbase${NC}"
echo "   ${GREEN}./pocketbase serve${NC}"
echo ""
echo "3️⃣  PocketBase 会自动检测并应用 migrations"
echo ""
echo "你会看到类似的输出："
echo "   ${GREEN}> Applying migrations...${NC}"
echo "   ${GREEN}> ✅ Created tournaments collection${NC}"
echo "   ${GREEN}> ✅ Created topics collection${NC}"
echo "   ${GREEN}> ✅ Created timer_projects collection${NC}"
echo "   ${GREEN}> ✅ Updated users collection with WeChat fields${NC}"
echo "   ${GREEN}> 🎉 All collections created successfully!${NC}"
echo ""
echo "4️⃣  启动成功后，刷新浏览器页面"
echo ""
echo "================================================"
echo ""
echo -e "${GREEN}✅ Migration 文件已准备好！${NC}"
echo ""
echo "位置: pocketbase/pb_migrations/1734000001_create_all_collections.js"
echo ""
echo "现在就去重启 PocketBase 吧！"
echo ""




