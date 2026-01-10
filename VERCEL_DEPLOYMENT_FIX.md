# 🔧 Fix Vercel Deployment Error

## ❌ The Error

```
Error: The package `@vercel/docker` is not published on the npm registry
```

## 🔍 Problem

Vercel **no longer supports Docker builds** using `@vercel/docker`. The `pocketbase/vercel.json` file was trying to use this deprecated builder.

## ✅ Solution

**PocketBase cannot be deployed to Vercel.** It must be deployed to **Railway** instead.

### Architecture

- ✅ **Frontend** → Deploy to Vercel (React/Vite app)
- ✅ **Backend (PocketBase)** → Deploy to Railway (Docker)

## 🚀 Deployment Steps

### 1. Deploy Frontend to Vercel

Your frontend is already configured. In Vercel:

1. **Project Settings** → **Build & Development Settings**:
   - **Root Directory**: `tournament-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

2. **Environment Variables**:
   - `VITE_POCKETBASE_URL` = `https://pocketbase-railway-production-d9aa.up.railway.app`

3. **Deploy**:
   ```bash
   cd tournament-frontend
   vercel --prod
   ```

### 2. Deploy Backend to Railway

**Do NOT deploy PocketBase to Vercel.** Use Railway instead:

1. Go to: https://railway.app/dashboard
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select: `cowwwww/bianlun`
4. **Configure Service**:
   - **Root Directory**: `pocketbase`
   - **Add Volume**: Mount `/pb_data` (1GB minimum)
5. **Get URL**: Settings → Networking → Generate Domain

See `DEPLOY_TO_RAILWAY.md` for detailed Railway deployment steps.

## 📝 What I Fixed

1. ✅ **Removed** `pocketbase/vercel.json` (causing the error)
2. ✅ **Created** root `vercel.json` (for frontend deployment)
3. ✅ **Created** `.vercelignore` (excludes pocketbase folder)
4. ✅ **Created** `DEPLOY_TO_RAILWAY.md` (Railway deployment guide)

## 🎯 Next Steps

1. **Deploy PocketBase to Railway** (if not already deployed)
   - Follow `DEPLOY_TO_RAILWAY.md`
   - Your Railway URL: `https://pocketbase-railway-production-d9aa.up.railway.app`

2. **Fix API Rules** (if not done yet)
   - Use `fix-pocketbase-api-rules.html`
   - This fixes the 403 Forbidden error

3. **Deploy Frontend to Vercel**
   - Make sure `VITE_POCKETBASE_URL` environment variable is set
   - Deploy from `tournament-frontend` directory

## ✅ Current Status

- ✅ Frontend code ready for Vercel
- ✅ Backend should be on Railway (already configured)
- ✅ API rules fix tools created
- ✅ Configuration files updated

## 🔍 Verify Deployment

After deploying:

1. **Check Railway**: PocketBase should be running at your Railway URL
2. **Check Vercel**: Frontend should be accessible
3. **Test Connection**: Frontend should be able to fetch tournaments from PocketBase
4. **Fix API Rules**: If you see 403 errors, use the fix tools

---

**Important**: Never try to deploy PocketBase to Vercel. It requires Docker, which Vercel doesn't support anymore.

