#!/bin/bash

# Fly.io Deployment Script for PocketBase
# Make sure you've added a payment method at: https://fly.io/dashboard/qianhui-cao/billing

set -e

echo "🚀 Deploying PocketBase to Fly.io..."

# Add Fly CLI to PATH
export FLYCTL_INSTALL="/Users/mac/.fly"
export PATH="$FLYCTL_INSTALL/bin:$PATH"

# Navigate to pocketbase directory
cd "$(dirname "$0")"

# Create app if it doesn't exist
echo "📦 Creating Fly.io app..."
flyctl apps create bianluns-pocketbase --org personal || echo "App might already exist"

# Create persistent volume for database
echo "💾 Creating persistent volume..."
flyctl volumes create pb_data --region sin --size 1 || echo "Volume might already exist"

# Deploy
echo "🚀 Deploying..."
flyctl deploy

echo "✅ Deployment complete!"
echo "📍 Your PocketBase URL: https://bianluns-pocketbase.fly.dev"
echo "🔐 Admin panel: https://bianluns-pocketbase.fly.dev/_/"

