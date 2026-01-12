#!/bin/bash

echo "================================================"
echo "🚀 Cloudflare Tunnel Setup for PocketBase"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo -e "${RED}❌ cloudflared is not installed${NC}"
    echo ""
    echo "Install it:"
    echo "  macOS: brew install cloudflare/cloudflare/cloudflared"
    echo "  Linux: wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64"
    echo "  Windows: Download from https://github.com/cloudflare/cloudflared/releases"
    exit 1
fi

echo -e "${GREEN}✅ cloudflared is installed${NC}"
echo ""

# Step 1: Login
echo -e "${BLUE}📋 Step 1: Login to Cloudflare${NC}"
echo "This will open your browser..."
read -p "Press Enter to continue..."
cloudflared tunnel login

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Login failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Logged in successfully${NC}"
echo ""

# Step 2: Create tunnel
echo -e "${BLUE}📋 Step 2: Create Cloudflare Tunnel${NC}"
read -p "Enter tunnel name (default: pocketbase-tunnel): " TUNNEL_NAME
TUNNEL_NAME=${TUNNEL_NAME:-pocketbase-tunnel}

cloudflared tunnel create $TUNNEL_NAME

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to create tunnel${NC}"
    exit 1
fi

# Get tunnel ID
TUNNEL_ID=$(cloudflared tunnel list | grep $TUNNEL_NAME | awk '{print $1}')
echo -e "${GREEN}✅ Tunnel created: $TUNNEL_ID${NC}"
echo ""

# Step 3: Get PocketBase URL
echo -e "${BLUE}📋 Step 3: Configure PocketBase URL${NC}"
echo "Where is your PocketBase running?"
echo "1) Local (http://localhost:8090)"
echo "2) Railway (https://xxx.up.railway.app)"
echo "3) Fly.io (https://xxx.fly.dev)"
echo "4) Custom URL"
read -p "Choose option (1-4): " PB_OPTION

case $PB_OPTION in
    1)
        PB_URL="http://localhost:8090"
        ;;
    2)
        read -p "Enter Railway URL: " PB_URL
        ;;
    3)
        read -p "Enter Fly.io URL: " PB_URL
        ;;
    4)
        read -p "Enter custom URL: " PB_URL
        ;;
    *)
        PB_URL="http://localhost:8090"
        ;;
esac

echo -e "${GREEN}✅ PocketBase URL: $PB_URL${NC}"
echo ""

# Step 4: Get domain
echo -e "${BLUE}📋 Step 4: Configure Domain${NC}"
read -p "Enter subdomain for PocketBase API (e.g., 'api' for api.bianluns.com): " SUBDOMAIN
read -p "Enter your domain (e.g., bianluns.com): " DOMAIN

HOSTNAME="${SUBDOMAIN}.${DOMAIN}"
echo -e "${GREEN}✅ Hostname: $HOSTNAME${NC}"
echo ""

# Step 5: Create config file
echo -e "${BLUE}📋 Step 5: Create Tunnel Configuration${NC}"

# Get credentials file path
CREDENTIALS_FILE="$HOME/.cloudflared/${TUNNEL_ID}.json"

CONFIG_FILE="cloudflare-tunnel-config.yml"
cat > $CONFIG_FILE << EOF
tunnel: $TUNNEL_ID
credentials-file: $CREDENTIALS_FILE

ingress:
  # Route PocketBase API
  - hostname: $HOSTNAME
    service: $PB_URL
  
  # Catch-all rule (must be last)
  - service: http_status:404
EOF

echo -e "${GREEN}✅ Configuration file created: $CONFIG_FILE${NC}"
echo ""

# Step 6: DNS setup instructions
echo -e "${BLUE}📋 Step 6: DNS Configuration${NC}"
echo ""
echo "Go to Cloudflare Dashboard → DNS → Add Record:"
echo ""
echo "  Type: CNAME"
echo "  Name: $SUBDOMAIN"
echo "  Target: ${TUNNEL_ID}.cfargotunnel.com"
echo "  Proxy: Proxied (orange cloud) ✅"
echo ""
read -p "Press Enter after you've added the DNS record..."

# Step 7: Test tunnel
echo -e "${BLUE}📋 Step 7: Testing Tunnel${NC}"
echo "Starting tunnel in test mode..."
echo ""
echo -e "${YELLOW}⚠️  Keep this running and test in another terminal:${NC}"
echo "  curl https://$HOSTNAME/api/health"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the test${NC}"
echo ""

# Run tunnel
cloudflared tunnel --config $CONFIG_FILE run $TUNNEL_NAME

echo ""
echo "================================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "================================================"
echo ""
echo "Your PocketBase URL: https://$HOSTNAME"
echo ""
echo "To run tunnel in production:"
echo "  cloudflared tunnel --config $CONFIG_FILE run $TUNNEL_NAME"
echo ""
echo "Or run as a service:"
echo "  cloudflared service install"
echo "  # Then edit /etc/cloudflared/config.yml with your config"
echo ""
echo "Update your frontend environment variable:"
echo "  VITE_POCKETBASE_URL=https://$HOSTNAME"
echo ""


