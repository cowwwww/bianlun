# 🚀 Deploy PocketBase to Fly.io (Free Tier)

Fly.io offers a **free tier** with 3 shared-cpu-1x VMs and 3GB persistent volumes. It's accessible from China and perfect for PocketBase.

## ⚠️ First Step: Add Payment Method

Fly.io requires a credit card to be added (for fraud prevention), but **won't charge you** for free tier usage:

1. Go to: https://fly.io/dashboard/qianhui-cao/billing
2. Click "Add Payment Method"
3. Add your credit card (won't be charged for free tier)

## 🚀 Quick Deployment (After Adding Card):

### Option 1: Deploy via CLI (Recommended)

```bash
cd pocketbase

# Create the app
flyctl apps create bianluns-pocketbase --org personal

# Create persistent volume for database
flyctl volumes create pb_data --region sin --size 1

# Deploy!
flyctl deploy
```

### Option 2: Deploy via GitHub (Auto-deploy)

1. Go to: https://fly.io/dashboard
2. Click "New App" → "GitHub"
3. Select your repo: `cowwwww/bianlun`
4. Set **Root Directory**: `pocketbase`
5. Set **Region**: `sin` (Singapore - best for China)
6. Click "Deploy"

Fly.io will automatically:
- Build your Docker image
- Deploy PocketBase
- Give you a URL like: `https://bianluns-pocketbase.fly.dev`

## 📍 After Deployment:

### Access PocketBase Admin:
Visit: `https://bianluns-pocketbase.fly.dev/_/`

Default login:
- Email: `admin@example.com`
- Password: `password123`

**Change this immediately after first login!**

### Connect Your Frontend:
Update your frontend's environment variable:
- `VITE_POCKETBASE_URL` = `https://bianluns-pocketbase.fly.dev`

## 💰 Free Tier Limits:
- **3 shared-cpu-1x VMs** (256MB RAM each)
- **3GB persistent volumes** total
- **160GB outbound data transfer** per month
- **No charges** if you stay within limits

## 🌏 China Access:
Fly.io uses a global network and is accessible from China. The Singapore region (`sin`) provides the best latency for Chinese users.

## 🔧 Manual CLI Deployment:

If you prefer to deploy manually:

```bash
# Navigate to pocketbase directory
cd pocketbase

# Make sure you're logged in
flyctl auth login

# Create app (if not exists)
flyctl apps create bianluns-pocketbase --org personal

# Create volume for database
flyctl volumes create pb_data --region sin --size 1

# Deploy
flyctl deploy
```

## ✅ Your Backend URL:
After deployment, your PocketBase URL will be:
```
https://bianluns-pocketbase.fly.dev
```

**That's it! Your PocketBase backend will be live in ~3 minutes.** 🎉

