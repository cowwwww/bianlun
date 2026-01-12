# 🌐 Railway Custom Domain Setup

## ✅ Yes! Railway Supports Custom Domains

Railway allows you to use your own custom domain (like `bianluns.com`) for both frontend and backend services.

---

## 🚀 Setting Up Custom Domain on Railway

### For Backend (PocketBase)

1. **Go to Railway Dashboard**
   - Visit: https://railway.app/dashboard
   - Click on your PocketBase service

2. **Add Custom Domain**
   - Go to **"Settings"** tab
   - Scroll to **"Networking"** section
   - Click **"Generate Domain"** (if you haven't already)
   - Or click **"Custom Domain"** → **"Add Domain"**

3. **Enter Your Domain**
   - Enter: `api.bianluns.com` (or `pocketbase.bianluns.com`)
   - Railway will show you DNS records to add

4. **Configure DNS**
   - Go to your domain registrar (where you bought `bianluns.com`)
   - Add a **CNAME** record:
     ```
     Type: CNAME
     Name: api (or pocketbase)
     Value: [Railway-provided domain].up.railway.app
     TTL: Auto (or 3600)
     ```

5. **Wait for SSL**
   - Railway automatically provisions SSL certificates
   - Usually takes 5-10 minutes
   - You'll see "Valid" status when ready

6. **Update Frontend**
   - Update `VITE_POCKETBASE_URL` to: `https://api.bianluns.com`
   - Redeploy frontend

---

### For Frontend (React App)

Railway can also host your frontend! Here's how:

#### Option 1: Deploy Frontend to Railway (Recommended)

1. **Create New Service**
   - In Railway dashboard, click **"New"** → **"GitHub Repo"**
   - Select your repository: `cowwwww/bianlun`

2. **Configure Service**
   - **Root Directory**: `tournament-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s dist -l $PORT`
   - Or use a static file server

3. **Add Environment Variables**
   ```
   VITE_POCKETBASE_URL=https://api.bianluns.com
   PORT=3000
   ```

4. **Add Custom Domain**
   - Settings → Networking → Custom Domain
   - Add: `bianluns.com` and `www.bianluns.com`
   - Configure DNS:
     ```
     Type: CNAME
     Name: @ (or root)
     Value: [Railway-provided domain].up.railway.app
     ```

5. **Install Static File Server** (if needed)
   - Add to `tournament-frontend/package.json`:
     ```json
     "scripts": {
       "start": "serve -s dist -l $PORT"
     },
     "dependencies": {
       "serve": "^14.0.0"
     }
     ```

#### Option 2: Keep Frontend on Vercel/Cloudflare, Use Railway for Backend Only

This is what you currently have:
- ✅ Backend on Railway: `api.bianluns.com`
- ✅ Frontend on Vercel/Cloudflare: `bianluns.com`
- ✅ Both can use custom domains

---

## 📋 DNS Configuration Example

For `bianluns.com` domain:

### Backend (api.bianluns.com)
```
Type: CNAME
Name: api
Value: pocketbase-railway-production-d9aa.up.railway.app
TTL: Auto
```

### Frontend (bianluns.com)
**If using Railway:**
```
Type: CNAME
Name: @
Value: [your-frontend-service].up.railway.app
TTL: Auto
```

**If using Vercel/Cloudflare:**
- They'll provide their own DNS records
- Usually A records or CNAME

---

## 🔧 Railway Static Site Configuration

If deploying frontend to Railway, create `railway.json` in `tournament-frontend/`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npx serve -s dist -l $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Or use a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
RUN npm install -g serve
WORKDIR /app
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

---

## ✅ Benefits of Railway Custom Domain

- ✅ **Free SSL** - Automatic HTTPS certificates
- ✅ **Global CDN** - Fast worldwide
- ✅ **Easy Setup** - Just add DNS records
- ✅ **Auto-renewal** - SSL certificates auto-renew
- ✅ **Subdomains** - Use `api.bianluns.com`, `www.bianluns.com`, etc.

---

## 🎯 Recommended Setup

### Option A: Everything on Railway (Simplest)
- Backend: `api.bianluns.com` (Railway)
- Frontend: `bianluns.com` (Railway)
- **Pros**: One platform, easier management
- **Cons**: Railway free tier limits

### Option B: Hybrid (Current Setup)
- Backend: `api.bianluns.com` (Railway)
- Frontend: `bianluns.com` (Vercel/Cloudflare)
- **Pros**: Best of both platforms
- **Cons**: Two platforms to manage

---

## 📝 Steps to Add Custom Domain

1. **Railway Dashboard** → Your Service → Settings → Networking
2. **Click "Custom Domain"** → "Add Domain"
3. **Enter domain**: `api.bianluns.com`
4. **Copy DNS instructions** from Railway
5. **Add DNS record** at your domain registrar
6. **Wait 5-10 minutes** for DNS propagation
7. **Railway auto-provisions SSL** (you'll see "Valid" status)
8. **Done!** Your service is now at `https://api.bianluns.com`

---

## 🔍 Verify DNS Setup

After adding DNS records, verify with:

```bash
# Check DNS resolution
dig api.bianluns.com
nslookup api.bianluns.com

# Check SSL certificate
curl -I https://api.bianluns.com
```

---

## 💡 Tips

- **Use subdomains**: `api.bianluns.com` for backend, `www.bianluns.com` for frontend
- **Railway free tier**: Includes custom domains, but has usage limits
- **SSL**: Railway uses Let's Encrypt, auto-renewed
- **DNS propagation**: Can take up to 48 hours, usually 5-30 minutes

---

**Your current backend URL**: `https://pocketbase-railway-production-d9aa.up.railway.app`

**After custom domain**: `https://api.bianluns.com` ✅

