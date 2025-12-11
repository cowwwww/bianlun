# ⚡ Cloudflare Quick Start - 15 Minutes to Live!

## 🎯 Super Fast Deployment

Get bianluns.com live in 15 minutes using Cloudflare!

---

## 📋 What You Need

- [ ] GitHub account
- [ ] Cloudflare account (free) - https://cloudflare.com
- [ ] Railway account (free) - https://railway.app
- [ ] Domain: bianluns.com

---

## 🚀 Step 1: Push to GitHub (2 minutes)

```bash
cd /Users/mac/Downloads/bianluns\(9.5:10\)

# Initialize git (if not already)
git init
git add .
git commit -m "Ready for deployment"

# Create repo on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/bianluns.git
git push -u origin main
```

✅ Code on GitHub!

---

## 🚀 Step 2: Deploy Frontend to Cloudflare Pages (5 minutes)

### 2.1 Sign Up & Add Domain
1. Go to: https://dash.cloudflare.com
2. Sign up (free)
3. Click "Add a site" → Enter `bianluns.com`
4. Choose Free plan
5. Update nameservers at your registrar (copy from Cloudflare)

### 2.2 Deploy to Pages
1. Click "Workers & Pages"
2. Click "Create application" → "Pages"
3. Connect GitHub → Select your repo
4. Configure:
   ```
   Framework: Vite
   Build command: cd tournament-frontend && npm run build
   Build directory: tournament-frontend/dist
   ```
5. Add environment variable:
   ```
   VITE_POCKETBASE_URL = https://bianluns-api.up.railway.app
   ```
   (We'll create this in Step 3)
6. Click "Save and Deploy"

### 2.3 Add Custom Domain
1. In your Pages project → "Custom domains"
2. Add: `bianluns.com` and `www.bianluns.com`
3. Cloudflare auto-configures DNS

✅ Frontend live at `https://bianluns.com`!

---

## 🚀 Step 3: Deploy Backend to Railway (5 minutes)

### 3.1 Sign Up
1. Go to: https://railway.app
2. Sign up with GitHub
3. Free: $5 credit/month

### 3.2 Deploy PocketBase
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your `bianluns` repo
4. Click "+ New" → "Empty Service"
5. Click the service → "Settings"
6. Set:
   ```
   Root Directory: /pocketbase
   ```
7. Click "Deploy"

Railway auto-detects Dockerfile and deploys!

### 3.3 Configure
1. Click "Settings" → "Networking"
2. Click "Generate Domain"
3. Copy URL: `bianluns-api.up.railway.app`
4. Or add custom: `api.bianluns.com`

### 3.4 Add Storage
1. Click "Variables" → "New Volume"
2. Mount path: `/pb_data`
3. Save

✅ Backend live at `https://bianluns-api.up.railway.app`!

---

## 🚀 Step 4: Connect & Configure (3 minutes)

### 4.1 Update Frontend
1. Go back to Cloudflare Pages
2. Settings → Environment variables
3. Update `VITE_POCKETBASE_URL`:
   ```
   https://bianluns-api.up.railway.app
   ```
4. Redeploy (Deployments → Retry)

### 4.2 Setup PocketBase
1. Open: `https://bianluns-api.up.railway.app/_/`
2. Create admin account
3. Create collections:
   - **tournaments** (name, title, description, location, type, etc.)
   - **topics** (text, explanation, area, language)
4. Settings → Application → CORS origins:
   ```
   https://bianluns.com
   https://www.bianluns.com
   ```
5. Add sample tournament data

✅ Everything connected!

---

## 🎉 Done! Test Your Site

Visit: **https://bianluns.com**

You should see:
- ✅ Your tournament platform
- ✅ Fast loading (global CDN)
- ✅ SSL certificate (https)
- ✅ Ready for users!

---

## 🔐 WeChat Login (Later)

After your site is live:

1. Register: https://open.weixin.qq.com
2. Create "Website Application"
3. Get AppID & AppSecret
4. Configure in PocketBase: `https://bianluns-api.up.railway.app/_/`
5. Test: `https://bianluns.com/login`

---

## 💰 Cost

- **Cloudflare Pages**: FREE (unlimited)
- **Railway**: FREE ($5 credit/month)
- **SSL**: FREE (auto)
- **CDN**: FREE (global)

**Total: $0/month** (Free tier sufficient!)

Later if you grow:
- Railway: ~$5/month for more usage

---

## 📊 What You Get

✅ **Global CDN** - Fast everywhere
✅ **Auto SSL** - HTTPS included
✅ **Auto Deploy** - Push to GitHub = Live
✅ **DDoS Protection** - Cloudflare security
✅ **Analytics** - Built-in traffic stats
✅ **Zero Maintenance** - No server management
✅ **Auto Scaling** - Handles traffic spikes
✅ **99.9% Uptime** - Enterprise reliability

---

## 🐛 Troubleshooting

### Site not loading?
- Wait 5 minutes for DNS to propagate
- Check nameservers at your registrar

### Backend error?
- Check Railway logs
- Verify volume is mounted
- Check CORS settings

### Build failed?
- Check build logs in Cloudflare Pages
- Verify build command path

---

## 📞 Quick Links

- **Frontend**: https://bianluns.com
- **Backend Admin**: https://bianluns-api.up.railway.app/_/
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Railway Dashboard**: https://railway.app/dashboard

---

## ✅ Checklist

- [ ] Code pushed to GitHub
- [ ] Cloudflare account created
- [ ] Domain added to Cloudflare
- [ ] Nameservers updated
- [ ] Frontend deployed to Pages
- [ ] Custom domain added
- [ ] Railway account created
- [ ] Backend deployed
- [ ] Storage volume added
- [ ] PocketBase admin created
- [ ] Collections created
- [ ] CORS configured
- [ ] Site tested and working!

---

**That's it!** Your site is live on Cloudflare! 🎉

**Cost: $0** | **Time: 15 minutes** | **Performance: Excellent** ⚡

