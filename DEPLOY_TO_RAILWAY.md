# 🚀 Deploy PocketBase to Railway (Free & China-Accessible)

Railway offers a **free tier** with $5 credit monthly and **no credit card required** initially. It's accessible from China and perfect for PocketBase.

## Quick Deployment Steps:

### 1. Go to Railway
Visit: https://railway.app

### 2. Sign Up
- Click "Start a New Project"
- Sign up with GitHub (recommended) or email

### 3. Create New Project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your repo: `cowwwww/bianlun`
- Select the **`pocketbase`** directory as the root

### 4. Configure Deployment
Railway will auto-detect your Dockerfile. Make sure:
- **Root Directory**: `pocketbase`
- **Build Command**: (auto-detected from Dockerfile)
- **Start Command**: (auto-detected)

### 5. Add Environment Variables
In Railway dashboard → Your Project → Variables:
- `PORT` = `8090` (optional, already in Dockerfile)

### 6. Add Persistent Volume (Important!)
- Go to your service → Settings → Volumes
- Click "Add Volume"
- **Mount Path**: `/pb_data`
- **Size**: 1GB (free tier allows this)

### 7. Deploy!
Railway will automatically:
- Build your Docker image
- Deploy PocketBase
- Give you a URL like: `https://your-app.up.railway.app`

### 8. Access PocketBase Admin
Visit: `https://your-app.up.railway.app/_/`

Default login:
- Email: `admin@example.com`
- Password: `password123`

**Change this immediately after first login!**

## ✅ Your Backend URL
After deployment, your PocketBase URL will be:
```
https://your-app-name.up.railway.app
```

## 🔗 Connect Frontend
Update your frontend's environment variable:
- `VITE_POCKETBASE_URL` = `https://your-app-name.up.railway.app`

## 💰 Free Tier Limits
- **$5 credit/month** (enough for small apps)
- **500 hours** of runtime
- **1GB** persistent storage
- **No credit card** required initially

## 🌏 China Access
Railway uses Cloudflare, which is accessible from China. Your app will work for Chinese users!

---

**That's it! Your PocketBase backend will be live in ~2 minutes.** 🎉

