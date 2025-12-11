#!/bin/bash

echo "================================================"
echo "🚀 云赛 ArcX - 微信登录快速配置脚本"
echo "================================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查是否在正确的目录
if [ ! -d "tournament-frontend" ]; then
    echo -e "${RED}❌ 错误: 请在项目根目录运行此脚本${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 步骤 1: 创建前端环境变量文件${NC}"
cat > tournament-frontend/.env.local << 'EOF'
# 微信公众号配置
VITE_WECHAT_APPID=wx78427a667a2ca948
VITE_WECHAT_APPSECRET=67017e32df837f1fbf68d6eb488d9c87

# PocketBase 配置
VITE_POCKETBASE_URL=http://127.0.0.1:8090
VITE_API_URL=http://127.0.0.1:8090/api

# 应用配置
VITE_APP_URL=http://localhost:5173
EOF

echo -e "${GREEN}✅ 环境变量文件创建成功: tournament-frontend/.env.local${NC}"
echo ""

echo -e "${GREEN}✅ 步骤 2: 检查 PocketBase Hook${NC}"
if [ -f "pocketbase/pb_hooks/wechat_auth.pb.js" ]; then
    echo -e "${GREEN}✅ 微信认证Hook已存在${NC}"
else
    echo -e "${YELLOW}⚠️ 警告: 未找到微信认证Hook${NC}"
fi
echo ""

echo -e "${GREEN}✅ 步骤 3: 添加users集合微信字段${NC}"
echo "请在 PocketBase Admin (http://127.0.0.1:8090/_/) 中："
echo "1. 打开 users 集合"
echo "2. 添加字段:"
echo "   - wechatOpenid (Text, Unique)"
echo "   - wechatUnionid (Text)"
echo "   - avatar (URL)"
echo ""

echo -e "${GREEN}✅ 步骤 4: 配置微信公众平台${NC}"
echo "1. 登录: https://mp.weixin.qq.com/"
echo "2. 设置与开发 → 公众号设置 → 功能设置"
echo "3. 网页授权域名: 添加 'localhost'"
echo ""

echo "================================================"
echo -e "${GREEN}✅ 配置完成！${NC}"
echo "================================================"
echo ""
echo "下一步："
echo "1. 启动 PocketBase:"
echo "   cd pocketbase && ./pocketbase serve"
echo ""
echo "2. 启动前端 (新终端):"
echo "   cd tournament-frontend && npm run dev"
echo ""
echo "3. 访问: http://localhost:5173/login"
echo ""
echo "4. 点击 '🎯 使用微信登录'"
echo ""
echo -e "${YELLOW}⚠️ 注意: 需要在微信公众平台配置回调域名才能正常使用${NC}"
echo ""

