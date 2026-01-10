# 🚀 Deploy PocketBase via Railway Web Interface (2 Minutes!)

Since you're already logged into Railway, follow these steps:

## Quick Steps:

### 1. **Create New Project**
- Go to: https://railway.app/dashboard
- Click **"New Project"** (top right)

### 2. **Deploy from GitHub**
- Click **"Deploy from GitHub repo"**
- Select your repo: **`cowwwww/bianlun`**
- Click **"Deploy Now"**

### 3. **Configure Service** ⚠️ CRITICAL STEP!
After Railway detects your repo, you'll see a service configuration screen:

**Click on the service** → **Settings** → **Root Directory**:
- Change from `/` to: **`pocketbase`**
- Click **"Save"**

### 4. **Add Persistent Volume** ⚠️ VERY IMPORTANT!
Without this, your database will be lost!

- Click on your service
- Go to **"Settings"** tab
- Scroll to **"Volumes"** section
- Click **"Add Volume"**
- **Mount Path**: `/pb_data`
- **Size**: `1GB`
- Click **"Add"**

### 5. **Wait for Deployment**
Railway will automatically:
- ✅ Build your Docker image
- ✅ Deploy PocketBase
- ✅ Generate a public URL

### 6. **Get Your URL**
- Click on your service
- Go to **"Settings"** → **"Networking"**
- Copy your **Public Domain** (e.g., `your-app.up.railway.app`)

### 7. **Access Admin Panel**
Visit: `https://your-app.up.railway.app/_/`

**Default Login:**
- Email: `admin@example.com`
- Password: `password123`

⚠️ **Change password immediately!**

### 8. **Update Frontend**
In Vercel Dashboard → Frontend Project → Environment Variables:
- `VITE_POCKETBASE_URL` = `https://your-app.up.railway.app`

## ✅ Done!

Your PocketBase backend is now live! 🎉

---

## 🔍 If You Need Help:

**Can't find Root Directory setting?**
- Click on your service name in Railway dashboard
- Go to "Settings" tab
- Look for "Root Directory" field
- Change it to `pocketbase`

**Deployment failed?**
- Click on your service → "Deployments" tab
- Click on the failed deployment
- Check the logs for errors

**Can't access admin panel?**
- Make sure URL ends with `/_/`
- Check Railway logs for errors
- Verify service is running (green status)

