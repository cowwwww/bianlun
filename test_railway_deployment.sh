#!/bin/bash

echo "🧪 Testing Railway PocketBase Deployment"
echo "========================================"

# Get Railway URL from user
echo "Enter your Railway PocketBase URL (e.g., https://bianluns-api.up.railway.app):"
read RAILWAY_URL

if [ -z "$RAILWAY_URL" ]; then
    echo "❌ No URL provided"
    exit 1
fi

echo "🔍 Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s "$RAILWAY_URL/api/health")

if echo "$HEALTH_RESPONSE" | grep -q '"code":200'; then
    echo "✅ Health check passed!"
    echo "Response: $HEALTH_RESPONSE"
else
    echo "❌ Health check failed!"
    echo "Response: $HEALTH_RESPONSE"
    exit 1
fi

echo ""
echo "🔍 Testing tournaments collection..."
TOURNAMENTS_RESPONSE=$(curl -s "$RAILWAY_URL/api/collections/tournaments/records")

if echo "$TOURNAMENTS_RESPONSE" | grep -q '"items":'; then
    echo "✅ Tournaments API working!"
    echo "Found $(echo "$TOURNAMENTS_RESPONSE" | grep -o '"totalItems":[0-9]*' | cut -d':' -f2) tournaments"
else
    echo "❌ Tournaments API failed!"
    echo "Response: $TOURNAMENTS_RESPONSE"
    exit 1
fi

echo ""
echo "🎉 SUCCESS! Your Railway PocketBase is working!"
echo ""
echo "Next step: Update your Vercel frontend:"
echo "VITE_POCKETBASE_URL=$RAILWAY_URL"
echo ""
echo "Then redeploy your frontend on Vercel."

