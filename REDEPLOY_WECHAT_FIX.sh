#!/bin/bash

echo "🔧 修复微信域名验证 - 重新部署"
echo "================================"
echo ""

cd /Users/mac/Downloads/bianluns\(9.5:10\)/tournament-frontend

# 1. 确认验证文件存在
echo "📋 第1步: 检查验证文件..."
if [ -f "public/MP_verify_H2Jt0ih2ZyTRl0pO.txt" ]; then
  echo "✅ 验证文件存在: public/MP_verify_H2Jt0ih2ZyTRl0pO.txt"
  cat public/MP_verify_H2Jt0ih2ZyTRl0pO.txt
else
  echo "❌ 验证文件不存在！"
  exit 1
fi
echo ""

# 2. 安装依赖（如果需要）
echo "📦 第2步: 检查并安装依赖..."
if [ ! -d "node_modules" ]; then
  echo "正在安装依赖..."
  npm install
else
  echo "✅ 依赖已安装"
fi
echo ""

# 3. 构建项目
echo "🔨 第3步: 重新构建项目..."
npm run build
echo ""

# 4. 确认构建文件
echo "📋 第4步: 确认构建文件..."
if [ -f "dist/MP_verify_H2Jt0ih2ZyTRl0pO.txt" ]; then
  echo "✅ 验证文件已包含在构建中:"
  ls -lh dist/MP_verify_H2Jt0ih2ZyTRl0pO.txt
  echo "文件内容:"
  cat dist/MP_verify_H2Jt0ih2ZyTRl0pO.txt
else
  echo "❌ 构建中缺少验证文件！"
  exit 1
fi
echo ""

# 5. 部署到 Cloudflare Pages
echo "🚀 第5步: 部署到 Cloudflare Pages..."
echo ""
echo "请运行以下命令之一来部署:"
echo ""
echo "方法A - 使用 Wrangler (推荐):"
echo "  npx wrangler pages deploy dist --project-name=bianlun"
echo ""
echo "方法B - 使用 Git (自动部署):"
echo "  cd /Users/mac/Downloads/bianluns\(9.5:10\)"
echo "  git add ."
echo "  git commit -m 'Add WeChat verification file'"
echo "  git push"
echo ""
echo "================================"
echo ""
echo "⚠️ 部署完成后:"
echo "1. 等待 1-2 分钟让部署完成"
echo "2. 测试验证文件: https://bianlun-13v.pages.dev/MP_verify_H2Jt0ih2ZyTRl0pO.txt"
echo "3. 在微信公众平台点击'保存'"
echo ""



