#!/bin/bash

echo "🚀 Setting up PocketBase..."
echo ""

cd /Users/mac/Downloads/bianluns\(9.5:10\)/pocketbase

# Stop any running PocketBase instance
pkill -f pocketbase 2>/dev/null
sleep 2

# Remove old data to start fresh (optional - comment out if you want to keep data)
# rm -rf pb_data

# Start PocketBase in background
./pocketbase serve > pocketbase.log 2>&1 &
PB_PID=$!

echo "⏳ Waiting for PocketBase to start..."
sleep 3

# Check if PocketBase is running
if curl -s http://127.0.0.1:8090/api/health > /dev/null; then
    echo "✅ PocketBase is running!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Open Admin Dashboard: http://127.0.0.1:8090/_/"
    echo "2. Create your admin account"
    echo "3. PocketBase will auto-create 'users' collection"
    echo "4. Manually create 'tournaments' and 'topics' collections"
    echo ""
    echo "Or use the API to create collections programmatically."
    echo ""
    echo "PocketBase PID: $PB_PID"
else
    echo "❌ Failed to start PocketBase"
    exit 1
fi

