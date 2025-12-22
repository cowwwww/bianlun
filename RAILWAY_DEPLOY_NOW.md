# 🚀 Deploy PocketBase to Railway - Quick Start

## ✅ Everything is Ready!

Your PocketBase is configured and ready to deploy. Follow these simple steps:

## 📋 Step-by-Step Deployment:

### 1. **Go to Railway**
👉 https://railway.app

### 2. **Sign Up / Login**
- Click "Start a New Project" or "Login"
- Sign up with **GitHub** (recommended - easiest way)

### 3. **Create New Project**
- Click **"New Project"**
- Select **"Deploy from GitHub repo"**
- Authorize Railway to access your GitHub if needed
- Find and select your repo: **`cowwwww/bianlun`**

### 4. **Configure Service**
After selecting your repo, Railway will ask for configuration:

**Important Settings:**
- **Root Directory**: Type `pocketbase` (this is crucial!)
- **Build Command**: Leave empty (auto-detected from Dockerfile)
- **Start Command**: Leave empty (auto-detected from Dockerfile)

### 5. **Add Persistent Volume** ⚠️ IMPORTANT!
Without this, your database will be lost on restart!

1. Click on your service in Railway dashboard
2. Go to **"Settings"** tab
3. Scroll down to **"Volumes"** section
4. Click **"Add Volume"**
5. Set:
   - **Mount Path**: `/pb_data`
   - **Size**: `1GB` (free tier allows this)
6. Click **"Add"**

### 6. **Set Environment Variables** (Optional)
Go to **Variables** tab and add:
- `PORT` = `8090` (optional, already in Dockerfile)

### 7. **Deploy!**
Railway will automatically:
- ✅ Build your Docker image
- ✅ Deploy PocketBase
- ✅ Give you a public URL

### 8. **Get Your URL**
After deployment completes:
- Click on your service
- Go to **"Settings"** → **"Networking"**
- Copy your **Public Domain** (looks like: `your-app.up.railway.app`)

### 9. **Access PocketBase Admin**
Visit: `https://your-app.up.railway.app/_/`

**Default Login:**
- Email: `admin@example.com`
- Password: `password123`

⚠️ **Change this password immediately after first login!**

### 10. **Connect Your Frontend**
Update your frontend's environment variable in Vercel:
- Go to Vercel Dashboard → Your Frontend Project → Settings → Environment Variables
- Add/Update: `VITE_POCKETBASE_URL` = `https://your-app.up.railway.app`

## 🎯 Your URLs:
- **Backend API**: `https://your-app.up.railway.app`
- **Admin Panel**: `https://your-app.up.railway.app/_/`
- **API Health**: `https://your-app.up.railway.app/api/health`

## 💰 Free Tier:
- **$5 credit/month** (plenty for PocketBase)
- **500 hours** runtime
- **1GB** persistent storage
- **No credit card** required initially

## 🌏 China Access:
Railway uses Cloudflare, which is accessible from China. Your app will work perfectly for Chinese users!

## ⚡ Quick Checklist:
- [ ] Signed up at railway.app
- [ ] Created new project from GitHub repo
- [ ] Set root directory to `pocketbase`
- [ ] Added volume at `/pb_data` (1GB)
- [ ] Deployment completed successfully
- [ ] Got your Railway URL
- [ ] Accessed admin panel at `/_/`
- [ ] Updated frontend `VITE_POCKETBASE_URL`

**That's it! Your PocketBase will be live in ~2-3 minutes.** 🎉

---

## 🔧 Troubleshooting:

### Deployment fails?
- Check Railway logs: Click on service → "Deployments" → View logs
- Make sure root directory is `pocketbase` (not root)
- Verify Dockerfile exists in `pocketbase/` directory

### Can't access admin panel?
- Make sure you're visiting `/_/` (with trailing slash)
- Check Railway logs for errors
- Verify the service is running (green status)

### Database resets on restart?
- Make sure you added the persistent volume at `/pb_data`
- Check volume is mounted correctly in settings

### Need help?
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

