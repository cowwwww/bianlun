# 🔧 Fix Cloudflare Build Error

## The Problem

Cloudflare tried to build in the root directory, but your app is in `tournament-frontend/` subdirectory.

## ✅ Solution

When configuring Cloudflare Pages, use these **EXACT** settings:

---

## 📋 Cloudflare Pages Configuration

### Build Settings:

```
Framework preset: None (or Vite)

Build command: 
cd tournament-frontend && npm install --legacy-peer-deps && npm run build

Build output directory: 
tournament-frontend/dist

Root directory: 
(leave EMPTY or put "/")

Node version:
18
```

### Environment Variables:

Click "Add variable":
```
Name: VITE_POCKETBASE_URL
Value: https://bianluns-api.up.railway.app
```

(You'll update this after creating Railway backend)

---

## 🚀 Step-by-Step Fix

### Method 1: Recreate Deployment (Easiest)

1. **Delete Failed Deployment:**
   - In Cloudflare Pages dashboard
   - Go to your project
   - Deployments → Click failed deployment → "Delete"

2. **Retry with Correct Settings:**
   - Settings → Builds & deployments
   - Edit configuration
   - Update build command: `cd tournament-frontend && npm install --legacy-peer-deps && npm run build`
   - Update output directory: `tournament-frontend/dist`
   - Save

3. **Trigger New Deployment:**
   - Deployments → "Retry deployment"
   - Or push a new commit to trigger auto-deploy

---

### Method 2: Start Fresh

1. **Delete Project:**
   - Cloudflare Pages → Your project
   - Settings → "Delete project"

2. **Create New Pages Project:**
   - Workers & Pages → Create application → Pages
   - Connect to Git → Select: cowwwww/bianlun
   - **USE THESE EXACT SETTINGS:**
   
   ```
   Build command: cd tournament-frontend && npm install --legacy-peer-deps && npm run build
   Build output: tournament-frontend/dist
   ```

3. **Add Environment Variable:**
   ```
   VITE_POCKETBASE_URL = https://bianluns-api.up.railway.app
   ```

4. **Deploy!**

---

## 🎯 Important Notes

### Build Command Must Include:

1. ✅ `cd tournament-frontend` - Go to correct directory
2. ✅ `npm install --legacy-peer-deps` - Install dependencies
3. ✅ `npm run build` - Build the app

Full command:
```bash
cd tournament-frontend && npm install --legacy-peer-deps && npm run build
```

### Output Directory Must Be:

```
tournament-frontend/dist
```

NOT just `dist`!

---

## ✅ What Should Happen

When configured correctly:

```
✓ Installing dependencies
✓ Building with Vite
✓ 11607 modules transformed
✓ Build complete
✓ Publishing to Cloudflare
✓ Deployment successful
```

You'll get: `https://bianluns.pages.dev` ✅

---

## 🐛 If Still Failing

### Check These:

1. **Build Command:**
   - Must start with `cd tournament-frontend`
   - Must include `npm install`
   - Must end with `npm run build`

2. **Output Directory:**
   - Must be `tournament-frontend/dist`
   - Check it includes the subdirectory!

3. **Node Version:**
   - Set to 18 or 20
   - In environment variables: `NODE_VERSION=18`

4. **Legacy Peer Deps:**
   - Must use `--legacy-peer-deps` flag
   - Your MUI packages need this

---

## 📊 Correct Settings Summary

Copy these exactly:

| Setting | Value |
|---------|-------|
| **Build command** | `cd tournament-frontend && npm install --legacy-peer-deps && npm run build` |
| **Build output** | `tournament-frontend/dist` |
| **Root directory** | *(empty)* |
| **Node version** | `18` |
| **Environment var** | `VITE_POCKETBASE_URL=https://bianluns-api.up.railway.app` |

---

## 🎯 After Fixing

1. Build will succeed ✅
2. Site live at: `https://bianluns.pages.dev`
3. Add custom domain: `bianluns.com`
4. Done! 🎉

---

## ⏭️ Next Steps

After build succeeds:
1. Deploy backend to Railway
2. Update VITE_POCKETBASE_URL
3. Setup PocketBase
4. Add custom domain
5. Live at bianluns.com! 🚀

---

**Quick tip:** Copy the exact build command from above - don't type it manually!

