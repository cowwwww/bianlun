# 🚂 Railway Deployment Guide for PocketBase Backend

## Quick Deploy Steps

### Option 1: Deploy via Railway Web Dashboard (Easiest)

1. **Go to Railway**: https://railway.app
2. **Sign up/Login** with GitHub
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repo**: `cowwwww/bianlun`
6. **Set Root Directory**: `pocketbase`
7. **Railway will auto-detect** the Dockerfile and deploy!

### Option 2: Deploy via Railway CLI

```bash
# 1. Login to Railway
railway login

# 2. Navigate to pocketbase directory
cd pocketbase

# 3. Initialize Railway project
railway init

# 4. Deploy
railway up
```

## Environment Variables

After deployment, set these in Railway Dashboard → Your Project → Variables:

- `PB_ENCRYPTION_KEY` = `your-random-32-character-key-here`

**Generate a key:**
```bash
openssl rand -hex 32
```

## Get Your Backend URL

After deployment:
1. Go to Railway Dashboard → Your Project
2. Click on the service
3. Go to "Settings" → "Networking"
4. Generate a domain (or use the default one)
5. Copy the URL (e.g., `https://pocketbase-production.up.railway.app`)

## Update Frontend

Once you have your Railway backend URL:

1. Go to Vercel Dashboard → Your Frontend Project
2. Settings → Environment Variables
3. Add: `VITE_POCKETBASE_URL` = `https://your-railway-url.up.railway.app`

## Test Your Deployment

- **Admin Panel**: `https://your-railway-url.up.railway.app/_/`
- **API Health**: `https://your-railway-url.up.railway.app/api/health`

Default login:
- Email: `admin@example.com`
- Password: `password123` (change this!)

## Troubleshooting

### If deployment fails:
- Check Railway logs in the dashboard
- Verify Dockerfile is correct
- Make sure `pb_data/` directory is included

### If admin panel doesn't load:
- Check that port 8090 is exposed
- Verify environment variables are set
- Check Railway service logs

## Railway Advantages

✅ **Perfect for Docker** - Native Docker support
✅ **Persistent storage** - Your database persists
✅ **Auto-deploy from GitHub** - Push to deploy
✅ **Free tier available** - $5 credit monthly
✅ **Easy scaling** - Upgrade when needed

Your PocketBase backend will be live in minutes! 🚀

