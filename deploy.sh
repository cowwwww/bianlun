#!/bin/bash

# Deployment script for bianluns.com
# This script helps you deploy to your production server

echo "🚀 Deployment Script for bianluns.com"
echo "======================================"
echo ""

# Configuration
SERVER_USER="root"
SERVER_HOST="YOUR_SERVER_IP"  # Change this to your server IP
DOMAIN="bianluns.com"

# Check if server IP is set
if [ "$SERVER_HOST" = "YOUR_SERVER_IP" ]; then
    echo "❌ Please edit deploy.sh and set SERVER_HOST to your server IP address"
    exit 1
fi

echo "📦 Step 1: Building frontend..."
cd tournament-frontend
npx tsc -b && node node_modules/vite/bin/vite.js build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
echo "✅ Build successful!"
echo ""

echo "📤 Step 2: Uploading files to server..."
echo "   Uploading frontend..."
rsync -avz --progress dist/ ${SERVER_USER}@${SERVER_HOST}:/var/www/${DOMAIN}/
echo ""

echo "📤 Step 3: Uploading PocketBase..."
cd ..
tar -czf pocketbase-deploy.tar.gz pocketbase/
scp pocketbase-deploy.tar.gz ${SERVER_USER}@${SERVER_HOST}:/opt/
ssh ${SERVER_USER}@${SERVER_HOST} "cd /opt && tar -xzf pocketbase-deploy.tar.gz && chmod +x pocketbase/pocketbase"
rm pocketbase-deploy.tar.gz
echo ""

echo "🔄 Step 4: Restarting services..."
ssh ${SERVER_USER}@${SERVER_HOST} << 'EOF'
    systemctl restart pocketbase
    systemctl reload nginx
EOF
echo ""

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your site should now be live at:"
echo "   Frontend: https://${DOMAIN}"
echo "   API: https://api.${DOMAIN}"
echo "   Admin: https://api.${DOMAIN}/_/"
echo ""
echo "🧪 Test your deployment:"
echo "   curl https://${DOMAIN}"
echo "   curl https://api.${DOMAIN}/api/health"
echo ""




