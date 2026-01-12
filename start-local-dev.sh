#!/bin/bash

# 🚀 Start Local Development Environment
# This script starts both PocketBase and the frontend

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting Local Development Environment${NC}"
echo ""

# Check if PocketBase executable exists
if [ ! -f "pocketbase/pocketbase" ]; then
    echo -e "${YELLOW}⚠️  PocketBase executable not found!${NC}"
    echo "Please download PocketBase from: https://pocketbase.io/docs/"
    echo "Or run: cd pocketbase && wget https://github.com/pocketbase/pocketbase/releases/download/v0.26.5/pocketbase_0.26.5_darwin_amd64.zip"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping services...${NC}"
    kill $PB_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start PocketBase
echo -e "${GREEN}📦 Starting PocketBase backend...${NC}"
cd pocketbase
./pocketbase serve > ../pocketbase.log 2>&1 &
PB_PID=$!
cd ..

# Wait for PocketBase to start
echo -e "${YELLOW}⏳ Waiting for PocketBase to start...${NC}"
sleep 3

# Check if PocketBase is running
if curl -s http://127.0.0.1:8090/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PocketBase is running at http://127.0.0.1:8090${NC}"
    echo -e "   Admin Dashboard: ${BLUE}http://127.0.0.1:8090/_/${NC}"
else
    echo -e "${YELLOW}⚠️  PocketBase might still be starting...${NC}"
fi

echo ""

# Start Frontend
echo -e "${GREEN}🎨 Starting Frontend...${NC}"
cd tournament-frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Set environment variable for local development
export VITE_POCKETBASE_URL=http://127.0.0.1:8090

# Start Vite dev server
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ Development environment started!${NC}"
echo ""
echo -e "${BLUE}📍 Services:${NC}"
echo -e "   Backend:  ${GREEN}http://127.0.0.1:8090${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:5173${NC}"
echo -e "   Admin:    ${BLUE}http://127.0.0.1:8090/_/${NC}"
echo ""
echo -e "${YELLOW}💡 Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for both processes
wait

