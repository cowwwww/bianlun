# ☁️ Deploy to bianluns.com with Cloudflare

## Overview

We'll use Cloudflare's powerful platform:
- **Frontend** → Cloudflare Pages (Free, unlimited bandwidth!)
- **Backend** → PocketBase on Railway/Fly.io (Free tier)
- **Domain** → Cloudflare DNS & CDN

**Total Cost: $0-5/month** (Free tier available!)

---

## 🎯 Architecture

```
bianluns.com (Cloudflare Pages)
     ↓
Cloudflare CDN (global edge network)
     ↓
api.bianluns.com (PocketBase on Railway/Fly.io)
```

**Benefits:**
- ⚡ Super fast (global CDN)
- 💰 Free or very cheap
- 🔒 DDoS protection
- 📊 Analytics included
- 🌍 Global distribution

---

## 🚀 Part 1: Frontend on Cloudflare Pages

### Step 1: Setup Git Repository

If you haven't already:

```bash
cd /Users/mac/Downloads/bianluns\(9.5:10\)
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/bianluns.git
git push -u origin main
```

### Step 2: Deploy to Cloudflare Pages

1. **Go to Cloudflare Dashboard**
   - https://dash.cloudflare.com/
   - Sign up/Login

2. **Add Your Site**
   - Go to "Workers & Pages"
   - Click "Create application"
   - Click "Pages" tab
   - Click "Connect to Git"

3. **Connect GitHub**
   - Authorize Cloudflare
   - Select your repository: `bianluns`

4. **Configure Build**
   ```
   Framework preset: Vite
   Build command: cd tournament-frontend && npm run build
   Build output directory: tournament-frontend/dist
   Root directory: /
   ```

5. **Environment Variables**
   Click "Environment variables" and add:
   ```
   VITE_POCKETBASE_URL = https://bianluns-api.fly.dev
   ```
   (We'll set this up in Part 2)

6. **Deploy**
   - Click "Save and Deploy"
   - Wait 2-3 minutes
   - You'll get: `https://bianluns.pages.dev`

### Step 3: Add Custom Domain

1. **Add Domain to Cloudflare**
   - Dashboard → "Add a site"
   - Enter: `bianluns.com`
   - Select Free plan
   - Update nameservers at your registrar

2. **Configure Pages Domain**
   - Go to your Pages project
   - Click "Custom domains"
   - Click "Set up a custom domain"
   - Enter: `bianluns.com`
   - Also add: `www.bianluns.com`
   - Cloudflare automatically adds SSL ✅

**Done!** Your frontend is now live at `https://bianluns.com` 🎉

---

## 🚀 Part 2: Backend on Railway (Recommended)

### Option A: Railway (Easy + Free Tier)

#### Step 1: Sign Up

1. Go to: https://railway.app/
2. Sign up with GitHub
3. Free tier: $5 credit/month (enough for PocketBase!)

#### Step 2: Create New Project

1. Click "New Project"
2. Select "Empty Project"
3. Click "Deploy from GitHub repo"
4. Connect your repo (or create new one for PocketBase)

#### Step 3: Deploy PocketBase

**Method 1: Using Dockerfile**

Create `Dockerfile` in your pocketbase folder:

```dockerfile
FROM alpine:latest

# Install dependencies
RUN apk add --no-cache \
    ca-certificates \
    unzip \
    wget \
    zip

# Download PocketBase
ARG PB_VERSION=0.22.0
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
    && unzip pocketbase_${PB_VERSION}_linux_amd64.zip \
    && chmod +x pocketbase

EXPOSE 8090

CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090"]
```

Push to GitHub:
```bash
cd pocketbase
git add Dockerfile
git commit -m "Add Dockerfile"
git push
```

In Railway:
1. Select your repo
2. Railway auto-detects Dockerfile
3. Click "Deploy"
4. Wait 2-3 minutes

#### Step 4: Configure Railway

1. **Settings** → **Environment**
   - Add: `PORT=8090`

2. **Settings** → **Networking**
   - Click "Generate Domain"
   - You'll get: `bianluns-api.up.railway.app`
   - Or add custom: `api.bianluns.com`

3. **Settings** → **Volumes**
   - Add persistent storage: `/pb_data`
   - This keeps your database safe!

**Done!** Backend is live at `https://bianluns-api.up.railway.app` 🎉

---

## 🚀 Part 2: Backend on Fly.io (Alternative)

### Step 1: Install Fly CLI

```bash
# macOS
brew install flyctl

# Login
flyctl auth login
```

### Step 2: Create fly.toml

Create `fly.toml` in pocketbase folder:

```toml
app = "bianluns-api"

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "8090"

[[services]]
  internal_port = 8090
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

[[services.http_checks]]
  interval = 10000
  timeout = 2000
  grace_period = "5s"
  method = "get"
  path = "/api/health"

[mounts]
  source = "pb_data"
  destination = "/pb_data"
```

### Step 3: Deploy

```bash
cd pocketbase

# Create app
flyctl launch --name bianluns-api

# Create volume for database
flyctl volumes create pb_data --size 1

# Deploy
flyctl deploy

# Get URL
flyctl status
```

You'll get: `https://bianluns-api.fly.dev`

### Step 4: Add Custom Domain

```bash
flyctl certs add api.bianluns.com
```

Follow instructions to add DNS record.

**Done!** Backend is live! 🎉

---

## 🔧 Part 3: Connect Everything

### Step 1: Update Frontend Environment Variable

In Cloudflare Pages:
1. Go to Settings → Environment variables
2. Update `VITE_POCKETBASE_URL`:
   ```
   https://bianluns-api.up.railway.app
   ```
   or
   ```
   https://bianluns-api.fly.dev
   ```
   or
   ```
   https://api.bianluns.com
   ```

3. Redeploy your Pages project

### Step 2: Configure CORS in PocketBase

Access your PocketBase admin:
- Railway: `https://bianluns-api.up.railway.app/_/`
- Fly.io: `https://bianluns-api.fly.dev/_/`

1. Create admin account
2. Go to Settings → Application
3. Add to **CORS origins**:
   ```
   https://bianluns.com
   https://www.bianluns.com
   https://bianluns.pages.dev
   ```

### Step 3: Set Up Collections

In PocketBase admin:
1. Create `tournaments` collection
2. Create `topics` collection
3. Set API rules to allow public read
4. Add sample data

---

## 🔐 Part 4: Configure DNS (Cloudflare)

In Cloudflare Dashboard → DNS:

### For Frontend:
Should auto-configure when you add custom domain in Pages.

### For Backend:

If using Railway:
```
Type: CNAME
Name: api
Target: YOUR_APP.up.railway.app
Proxy: Enabled (orange cloud)
```

If using Fly.io:
```
Type: A
Name: api
Target: [IP from flyctl status]
Proxy: Enabled (orange cloud)
```

---

## 🔐 WeChat Login Setup

Same as before, but update URLs:

1. **WeChat Open Platform**
   - Website: `https://bianluns.com`
   - Callback domain: `bianluns.com`

2. **PocketBase OAuth**
   - Admin: `https://api.bianluns.com/_/`
   - Add WeChat provider
   - Enter AppID & AppSecret

---

## 💰 Cost Comparison

| Service | Provider | Free Tier | Paid |
|---------|----------|-----------|------|
| **Frontend** | Cloudflare Pages | Unlimited | Free |
| **Backend** | Railway | $5 credit/mo | $5/month |
| **Backend** | Fly.io | 3 VMs free | $1.94/month |
| **CDN** | Cloudflare | Unlimited | Free |
| **SSL** | Cloudflare | Included | Free |
| **DNS** | Cloudflare | Included | Free |
| **DDoS Protection** | Cloudflare | Included | Free |
| **Total** | | **FREE** | **$0-5/mo** |

**Recommended:** Railway ($5/month) - easiest setup

---

## ⚡ Performance Benefits

With Cloudflare:
- **Global CDN**: 300+ cities worldwide
- **Fast**: Static assets cached at edge
- **Always Online**: Offline page if backend down
- **Analytics**: Free traffic insights
- **Security**: DDoS protection, bot detection
- **Auto SSL**: Free SSL certificates

---

## 🧪 Testing

### Test Frontend:
```bash
curl https://bianluns.com
```

### Test Backend:
```bash
curl https://api.bianluns.com/api/health
# or
curl https://bianluns-api.up.railway.app/api/health
```

### Test WeChat Login:
1. Go to `https://bianluns.com/login`
2. Click "微信登录"
3. Should show QR code

---

## 🚀 Quick Deploy Script (Cloudflare + Railway)

```bash
#!/bin/bash

# 1. Build frontend
cd tournament-frontend
npm run build

# 2. Push to GitHub
git add .
git commit -m "Deploy to production"
git push origin main

# 3. Cloudflare Pages will auto-deploy

# 4. Deploy PocketBase to Railway
cd ../pocketbase
git add Dockerfile
git commit -m "Add Dockerfile"
git push railway main

echo "✅ Deployed!"
echo "Frontend: https://bianluns.com"
echo "Backend: https://api.bianluns.com"
```

---

## 📊 Deployment Checklist

**Frontend (Cloudflare Pages)**
- [ ] GitHub repo created
- [ ] Connected to Cloudflare Pages
- [ ] Build configured (Vite)
- [ ] Environment variable set (VITE_POCKETBASE_URL)
- [ ] Custom domain added (bianluns.com)
- [ ] SSL auto-configured

**Backend (Railway/Fly.io)**
- [ ] Account created
- [ ] PocketBase deployed
- [ ] Volume/storage configured
- [ ] Domain configured (api.bianluns.com)
- [ ] CORS configured
- [ ] Admin account created
- [ ] Collections created
- [ ] Sample data added

**DNS (Cloudflare)**
- [ ] Domain added to Cloudflare
- [ ] Nameservers updated
- [ ] DNS records configured
- [ ] Proxy enabled (orange cloud)

**WeChat OAuth**
- [ ] Open Platform account
- [ ] Website app created
- [ ] OAuth configured in PocketBase
- [ ] Tested login flow

---

## 🎯 Advantages Over Traditional VPS

| Feature | Cloudflare | Traditional VPS |
|---------|------------|-----------------|
| Setup Time | 10 minutes | 2+ hours |
| Cost | $0-5/month | $6+/month |
| Maintenance | Zero | Regular updates |
| Global CDN | Included | Extra cost |
| DDoS Protection | Included | Extra cost |
| Auto Scaling | Yes | Manual |
| SSL | Auto | Manual setup |
| Backups | Included | Manual |

---

## 🆘 Troubleshooting

### Frontend not updating?
```bash
# Force rebuild in Cloudflare Pages
1. Go to Deployments
2. Click "Retry deployment"
```

### Backend CORS error?
- Add your domain to PocketBase CORS settings
- Make sure proxy is enabled in Cloudflare

### WeChat login not working?
- Check callback URL matches exactly
- Verify HTTPS is working
- Check PocketBase logs in Railway/Fly.io

---

## 📚 Resources

- Cloudflare Pages: https://pages.cloudflare.com/
- Railway: https://railway.app/
- Fly.io: https://fly.io/
- PocketBase Docs: https://pocketbase.io/docs/

---

## 🎉 Summary

**What you get with Cloudflare:**
- ✅ Lightning fast (global CDN)
- ✅ Free or ultra-cheap ($0-5/month)
- ✅ Auto-scaling
- ✅ Zero maintenance
- ✅ Built-in DDoS protection
- ✅ Free SSL certificates
- ✅ 99.99% uptime
- ✅ GitHub integration
- ✅ Auto deployments

**Perfect for bianluns.com!** 🚀

