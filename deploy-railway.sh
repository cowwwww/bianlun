#!/bin/bash

# Railway Deployment Script for PocketBase Backend

echo "🚂 Railway Deployment Helper"
echo "=============================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway first:"
    echo "   railway login"
    echo ""
    exit 1
fi

echo "✅ Railway CLI is ready"
echo ""

# Navigate to pocketbase directory
cd "$(dirname "$0")/pocketbase" || exit 1

echo "📦 Current directory: $(pwd)"
echo ""

# Check if already linked
if railway status &> /dev/null; then
    echo "✅ Project is already linked"
    echo ""
    echo "🚀 Deploying to Railway..."
    railway up
else
    echo "🔗 Linking to Railway project..."
    echo "   (If you don't have a project, create one at https://railway.app first)"
    echo ""
    railway link
    
    echo ""
    echo "🚀 Deploying to Railway..."
    railway up
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Set PB_ENCRYPTION_KEY in Railway Dashboard → Variables"
echo "   2. Get your Railway URL from Dashboard → Settings → Networking"
echo "   3. Update VITE_POCKETBASE_URL in Vercel frontend project"
echo ""

