#!/bin/bash

echo "🔍 检查 Cloudflare Pages 部署状态"
echo "================================"
echo ""

echo "📋 步骤1: 检查 Cloudflare Pages 部署"
echo "访问: https://dash.cloudflare.com/06a7d250a50ddd83f7eb7352e8cf55fe/pages/view/bianlun"
echo "查看最新部署是否完成（通常需要 1-2 分钟）"
echo ""

echo "⏳ 等待 30 秒后测试验证文件..."
sleep 5

echo ""
echo "📋 步骤2: 测试验证文件访问"
echo ""

# 测试域名1: bianlun-13v.pages.dev
echo "测试 bianlun-13v.pages.dev:"
RESPONSE1=$(curl -s -o /dev/null -w "%{http_code}" https://bianlun-13v.pages.dev/MP_verify_H2Jt0ih2ZyTRl0pO.txt)
if [ "$RESPONSE1" = "200" ]; then
  CONTENT1=$(curl -s https://bianlun-13v.pages.dev/MP_verify_H2Jt0ih2ZyTRl0pO.txt)
  if [ "$CONTENT1" = "H2Jt0ih2ZyTRl0pO" ]; then
    echo "  ✅ 访问成功！内容正确: $CONTENT1"
  else
    echo "  ⚠️ 可以访问但内容不对: $CONTENT1"
  fi
else
  echo "  ❌ HTTP $RESPONSE1 - 部署可能还在进行中，请等待..."
fi

echo ""

# 测试域名2: bianluns.com（如果配置了）
echo "测试 bianluns.com:"
RESPONSE2=$(curl -s -o /dev/null -w "%{http_code}" https://bianluns.com/MP_verify_H2Jt0ih2ZyTRl0pO.txt 2>/dev/null)
if [ "$RESPONSE2" = "200" ]; then
  CONTENT2=$(curl -s https://bianluns.com/MP_verify_H2Jt0ih2ZyTRl0pO.txt 2>/dev/null)
  echo "  ✅ 访问成功！内容: $CONTENT2"
else
  echo "  ℹ️ 自定义域名未配置或无法访问（这是正常的）"
fi

echo ""
echo "================================"
echo ""
echo "🎯 下一步操作:"
echo ""
echo "如果验证文件可以访问（✅）："
echo "  1. 回到微信公众平台"
echo "  2. 点击'保存'按钮"
echo "  3. 应该会显示验证成功"
echo ""
echo "如果验证文件还不能访问（❌）："
echo "  1. 等待 1-2 分钟让 Cloudflare 部署完成"
echo "  2. 再次运行此脚本: ./CHECK_DEPLOYMENT.sh"
echo "  3. 或手动访问: https://bianlun-13v.pages.dev/MP_verify_H2Jt0ih2ZyTRl0pO.txt"
echo ""
echo "🔗 测试链接:"
echo "  https://bianlun-13v.pages.dev/MP_verify_H2Jt0ih2ZyTRl0pO.txt"
echo ""

