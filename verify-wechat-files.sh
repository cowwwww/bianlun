#!/bin/bash

echo "🔍 验证微信域名验证文件"
echo "========================"
echo ""

# 检查文件是否存在
echo "📁 检查文件位置..."
FILES=(
  "tournament-frontend/public/MP_verify_H2Jt0ih2ZyTRl0pO.txt"
  "tournament-frontend/dist/MP_verify_H2Jt0ih2ZyTRl0pO.txt"
  "public/MP_verify_H2Jt0ih2ZyTRl0pO.txt"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
    CONTENT=$(cat "$file")
    echo "   内容: $CONTENT"
  else
    echo "❌ $file (不存在)"
  fi
done

echo ""
echo "========================"
echo ""
echo "📋 下一步操作："
echo ""
echo "1. 构建项目："
echo "   cd tournament-frontend"
echo "   npm run build"
echo ""
echo "2. 部署到生产环境："
echo "   - Cloudflare Pages: npx wrangler pages deploy dist"
echo "   - Firebase: firebase deploy --only hosting"
echo "   - Vercel: vercel --prod"
echo ""
echo "3. 在微信公众平台设置授权回调域名："
echo "   https://mp.weixin.qq.com/"
echo "   设置与开发 → 接口权限 → 网页授权 → 修改"
echo ""
echo "4. 测试验证文件访问："
echo "   https://你的域名.com/MP_verify_H2Jt0ih2ZyTRl0pO.txt"
echo ""
