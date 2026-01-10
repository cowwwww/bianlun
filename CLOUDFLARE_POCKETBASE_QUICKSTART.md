# ⚡ Quick Start: PocketBase with Cloudflare URL

## 🎯 What This Does

Sets up PocketBase to be accessible via a Cloudflare URL (e.g., `https://api.bianluns.com`) using Cloudflare Tunnel.

**Benefits:**
- ✅ Free Cloudflare URL
- ✅ Free SSL certificate
- ✅ DDoS protection
- ✅ Global CDN
- ✅ Works with any PocketBase deployment (local, Railway, Fly.io)

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Cloudflare Tunnel

**macOS:**
```bash
brew install cloudflare/cloudflare/cloudflared
```

**Linux:**
```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
```

### Step 2: Run Setup Script

```bash
cd /Users/mac/Downloads/bianluns\(9.5:10\)
./setup-cloudflare-tunnel.sh
```

The script will:
1. ✅ Login to Cloudflare
2. ✅ Create a tunnel
3. ✅ Configure PocketBase URL
4. ✅ Set up DNS
5. ✅ Test connection

### Step 3: Update Frontend

In Cloudflare Pages dashboard:
1. Go to your project → Settings → Environment variables
2. Update `VITE_POCKETBASE_URL` to your Cloudflare URL:
   ```
   https://api.bianluns.com
   ```
3. Redeploy

---

## 📋 Manual Setup (If Script Doesn't Work)

### 1. Login to Cloudflare
```bash
cloudflared tunnel login
```

### 2. Create Tunnel
```bash
cloudflared tunnel create pocketbase-tunnel
```

### 3. Create Config File

Create `cloudflare-tunnel-config.yml`:

```yaml
tunnel: <YOUR_TUNNEL_ID>
credentials-file: ~/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: api.bianluns.com
    service: http://localhost:8090  # or your Railway/Fly.io URL
  
  - service: http_status:404
```

### 4. Add DNS Record

In Cloudflare Dashboard → DNS:
- **Type:** CNAME
- **Name:** `api`
- **Target:** `<TUNNEL_ID>.cfargotunnel.com`
- **Proxy:** Proxied ✅

### 5. Run Tunnel
```bash
cloudflared tunnel --config cloudflare-tunnel-config.yml run pocketbase-tunnel
```

---

## 🔧 For Production (Always-On)

### Option A: Run as Service (macOS/Linux)

```bash
# Install service
cloudflared service install

# Copy config
sudo cp cloudflare-tunnel-config.yml /etc/cloudflared/config.yml

# Start service
sudo cloudflared service start
```

### Option B: Use PM2 (Node.js)

```bash
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'cloudflare-tunnel',
    script: 'cloudflared',
    args: 'tunnel --config cloudflare-tunnel-config.yml run pocketbase-tunnel',
    autorestart: true,
    watch: false
  }]
}
EOF

# Start
pm2 start ecosystem.config.js
pm2 save
```

### Option C: Deploy Tunnel to Railway/Fly.io

See `SETUP_CLOUDFLARE_TUNNEL.md` for Docker setup.

---

## ✅ Verify It Works

1. **Check tunnel status:**
   ```bash
   cloudflared tunnel info pocketbase-tunnel
   ```

2. **Test PocketBase:**
   ```bash
   curl https://api.bianluns.com/api/health
   ```

3. **Access admin:**
   Open: `https://api.bianluns.com/_/`

---

## 🎯 Your Cloudflare PocketBase URL

After setup, use this URL in your frontend:

```
https://api.bianluns.com
```

Update environment variable:
```env
VITE_POCKETBASE_URL=https://api.bianluns.com
```

---

## 🐛 Troubleshooting

**Tunnel not connecting?**
- Check PocketBase is running: `curl http://localhost:8090/api/health`
- Verify DNS: CNAME should point to `<TUNNEL_ID>.cfargotunnel.com`
- Check credentials: `ls ~/.cloudflared/`

**CORS errors?**
- PocketBase Admin → Settings → Application
- Add to Allowed origins:
  ```
  https://bianluns.com
  https://www.bianluns.com
  https://bianluns.pages.dev
  ```

**404 errors?**
- Verify hostname in config matches DNS record
- Make sure catch-all rule is last in config

---

## 📚 Full Documentation

See `SETUP_CLOUDFLARE_TUNNEL.md` for detailed instructions.

---

## 🎉 Done!

Your PocketBase is now accessible through Cloudflare! 🚀

