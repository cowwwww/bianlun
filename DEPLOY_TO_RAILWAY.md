# 🚀 Deploy PocketBase to Railway

## ⚠️ Important: Vercel Doesn't Support Docker

Vercel no longer supports Docker builds (`@vercel/docker` is deprecated). **PocketBase must be deployed to Railway** instead.

## ✅ Quick Deploy to Railway

### Step 1: Go to Railway Dashboard

1. Visit: https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose: **cowwwww/bianlun**

### Step 2: Configure the Service

1. Click on the created service
2. Go to **"Settings"** tab
3. Set **Root Directory**: `pocketbase`
4. Click **"Save"**

### Step 3: Add Persistent Volume (CRITICAL!)

1. In **"Settings"** tab, scroll to **"Volumes"**
2. Click **"Add Volume"**
3. **Mount Path**: `/pb_data`
4. **Size**: `1GB` (or more if needed)
5. Click **"Add"**

### Step 4: Get Your Railway URL

1. Go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"** (if not already generated)
3. Copy your public domain (e.g., `pocketbase-railway-production-d9aa.up.railway.app`)

### Step 5: Update Frontend Environment Variable

In your Vercel project (for the frontend):

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add/Update:
   - **Name**: `VITE_POCKETBASE_URL`
   - **Value**: `https://your-railway-url.up.railway.app`
3. Redeploy the frontend

## ✅ Your Current Setup

Based on your code, you already have:
- ✅ Railway URL: `https://pocketbase-railway-production-d9aa.up.railway.app`
- ✅ Frontend configured to use this URL
- ✅ Railway configuration files (`railway.json`)

## 🔧 If Railway Deployment Fails

### Check Railway Logs

1. Go to Railway Dashboard → Your Service → **"Deployments"**
2. Click on the latest deployment
3. Check the logs for errors

### Common Issues

1. **Database not persisting**: Make sure you added the volume at `/pb_data`
2. **Port issues**: Railway automatically handles port mapping
3. **Build fails**: Check that `Dockerfile` is in the `pocketbase` directory

## 📝 Railway Configuration

Your `pocketbase/railway.json` is already configured correctly:

```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  }
}
```

## 🎯 Next Steps

1. ✅ Deploy PocketBase to Railway (follow steps above)
2. ✅ Fix API rules (use `fix-pocketbase-api-rules.html`)
3. ✅ Update frontend environment variable in Vercel
4. ✅ Redeploy frontend

---

**Note**: The frontend can stay on Vercel, but PocketBase must be on Railway (or another platform that supports Docker).
