# 🚀 Setup PocketBase with Cloudflare Tunnel

This guide will help you expose PocketBase through Cloudflare's network, giving you a Cloudflare URL for your backend.

## 📋 Prerequisites

1. Cloudflare account (free): https://dash.cloudflare.com
2. PocketBase running somewhere (local, Railway, Fly.io, or VPS)

---

## 🎯 Option 1: Cloudflare Tunnel (Recommended - Free Cloudflare URL)

### Step 1: Install Cloudflare Tunnel

**macOS:**
```bash
brew install cloudflare/cloudflare/cloudflared
```

**Linux:**
```bash
# Download cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
```

**Windows:**
Download from: https://github.com/cloudflare/cloudflared/releases

### Step 2: Login to Cloudflare

```bash
cloudflared tunnel login
```

This will open your browser. Select the domain you want to use (e.g., `bianluns.com` or a subdomain).

### Step 3: Create a Tunnel

```bash
cloudflared tunnel create pocketbase-tunnel
```

This will create a tunnel and give you a tunnel ID. Save this ID!

### Step 4: Create Configuration File

Create `cloudflare-tunnel-config.yml` in your project root:

```yaml
tunnel: <YOUR_TUNNEL_ID>
credentials-file: /Users/mac/.cloudflared/<TUNNEL_ID>.json

ingress:
  # Route PocketBase API
  - hostname: api.bianluns.com  # or pocketbase.bianluns.com
    service: http://localhost:8090  # Change if PocketBase is elsewhere
  
  # Catch-all rule (must be last)
  - service: http_status:404
```

**If PocketBase is on Railway/Fly.io:**
```yaml
tunnel: <YOUR_TUNNEL_ID>
credentials-file: /Users/mac/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: api.bianluns.com
    service: https://bianluns-api.up.railway.app  # Your Railway/Fly.io URL
  
  - service: http_status:404
```

### Step 5: Run the Tunnel

**For local PocketBase:**
```bash
# Make sure PocketBase is running first
cd pocketbase
./pocketbase serve

# In another terminal, run the tunnel
cloudflared tunnel --config cloudflare-tunnel-config.yml run pocketbase-tunnel
```

**For production (always-on):**
```bash
cloudflared tunnel --config cloudflare-tunnel-config.yml run pocketbase-tunnel
```

### Step 6: Configure DNS

1. Go to Cloudflare Dashboard → Your Domain → DNS
2. Add a CNAME record:
   - **Name:** `api` (or `pocketbase`)
   - **Target:** `<TUNNEL_ID>.cfargotunnel.com`
   - **Proxy status:** Proxied (orange cloud) ✅

### Step 7: Update Frontend

Update your Cloudflare Pages environment variable:
- `VITE_POCKETBASE_URL` = `https://api.bianluns.com`

---

## 🎯 Option 2: Deploy PocketBase + Cloudflare Tunnel (Production)

### Step 1: Deploy PocketBase to Railway/Fly.io

Follow the existing guides:
- `DEPLOY_TO_RAILWAY.md` or
- `DEPLOY_TO_FLYIO.md`

### Step 2: Set Up Cloudflare Tunnel on Your Server

If you have a VPS or want to run tunnel on Railway:

**Create `cloudflare-tunnel/Dockerfile`:**
```dockerfile
FROM cloudflare/cloudflared:latest
COPY config.yml /etc/cloudflared/config.yml
CMD ["tunnel", "run"]
```

**Create `cloudflare-tunnel/config.yml`:**
```yaml
tunnel: <YOUR_TUNNEL_ID>
credentials-file: /etc/cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: api.bianluns.com
    service: https://bianluns-api.up.railway.app
  
  - service: http_status:404
```

### Step 3: Deploy Tunnel

Deploy the tunnel service to Railway/Fly.io or run on a VPS.

---

## 🎯 Option 3: Quick Setup Script

Run the setup script:

```bash
chmod +x setup-cloudflare-tunnel.sh
./setup-cloudflare-tunnel.sh
```

---

## ✅ Verify Setup

1. **Check Tunnel Status:**
   ```bash
   cloudflared tunnel info pocketbase-tunnel
   ```

2. **Test PocketBase URL:**
   ```bash
   curl https://api.bianluns.com/api/health
   ```

3. **Access Admin Panel:**
   Open: `https://api.bianluns.com/_/`

---

## 🔧 Troubleshooting

### Tunnel not connecting?
- Check if PocketBase is running: `curl http://localhost:8090/api/health`
- Verify tunnel credentials: `ls ~/.cloudflared/`
- Check DNS: Make sure CNAME points to `<TUNNEL_ID>.cfargotunnel.com`

### CORS errors?
- In PocketBase Admin → Settings → Application
- Add to Allowed origins:
  ```
  https://bianluns.com
  https://www.bianluns.com
  https://bianluns.pages.dev
  ```

### 404 errors?
- Check ingress rules in config.yml
- Make sure catch-all rule is last
- Verify hostname matches DNS record

---

## 📝 Your Cloudflare PocketBase URL

After setup, your PocketBase will be accessible at:
```
https://api.bianluns.com
```

Update your frontend:
```env
VITE_POCKETBASE_URL=https://api.bianluns.com
```

---

## 🎉 Done!

Your PocketBase is now accessible through Cloudflare's global network with:
- ✅ Free SSL certificate
- ✅ DDoS protection
- ✅ Global CDN
- ✅ Cloudflare URL

