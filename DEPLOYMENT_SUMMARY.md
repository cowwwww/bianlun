# 🎉 Ready to Deploy to bianluns.com!

## ✅ What's Ready

### Files Created:
- ✅ **Production build** (`tournament-frontend/dist/`) - Ready to upload
- ✅ **WeChat login component** - Ready for integration
- ✅ **OAuth callback handler** - Handles WeChat returns
- ✅ **Environment configs** - Production & development settings
- ✅ **Deployment guides** - Complete instructions
- ✅ **Deployment script** - Automated deployment

### Code Updates:
- ✅ PocketBase URL configured for production
- ✅ WeChat login integration complete
- ✅ TypeScript compilation successful
- ✅ Build optimized for production (196KB gzipped)

---

## 🚀 Quick Deployment Options

### Option 1: Automated Deployment (Recommended)

1. **Edit `deploy.sh`:**
   ```bash
   nano deploy.sh
   # Change SERVER_HOST="YOUR_SERVER_IP" to your actual server IP
   ```

2. **Run deployment:**
   ```bash
   ./deploy.sh
   ```

That's it! Everything deploys automatically.

---

### Option 2: Manual Deployment

#### A. Deploy Frontend

```bash
# 1. Upload to server
scp -r tournament-frontend/dist/* root@your-server:/var/www/bianluns.com/

# 2. Set permissions
ssh root@your-server "chown -R www-data:www-data /var/www/bianluns.com"
```

#### B. Deploy PocketBase

```bash
# 1. Compress PocketBase
tar -czf pocketbase.tar.gz pocketbase/

# 2. Upload
scp pocketbase.tar.gz root@your-server:/opt/

# 3. Extract and setup
ssh root@your-server
cd /opt
tar -xzf pocketbase.tar.gz
chmod +x pocketbase/pocketbase

# 4. Create service (see DEPLOY_TO_PRODUCTION.md)
```

---

### Option 3: Use Hosting Services

#### Frontend → Vercel (Free & Easy)

1. Push code to GitHub
2. Go to https://vercel.com
3. Import repository
4. Settings:
   - Framework: Vite
   - Build: `npm run build`
   - Output: `dist`
   - Environment variable: `VITE_POCKETBASE_URL=https://api.bianluns.com`
5. Add custom domain: bianluns.com

#### Backend → Your VPS

Follow PocketBase deployment in DEPLOY_TO_PRODUCTION.md

---

## 🔐 WeChat Login Setup Checklist

After deployment, set up WeChat login:

- [ ] **Register WeChat Open Platform** 
  - https://open.weixin.qq.com/
  - Create website application
  - Get AppID & AppSecret

- [ ] **Configure PocketBase OAuth2**
  - Go to: https://api.bianluns.com/_/
  - Settings → Auth providers
  - Add WeChat OAuth2
  - Enter AppID & AppSecret

- [ ] **Update Callback URL**
  - In WeChat: Set callback domain to `bianluns.com`
  - In PocketBase: Verify redirect URL

- [ ] **Test Login**
  - Go to: https://bianluns.com/login
  - Click "微信登录"
  - Scan QR code
  - Verify successful login

**Detailed steps:** See `WECHAT_LOGIN_SETUP.md`

---

## 🎯 DNS Configuration

Make sure these DNS records are set:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | Your_Server_IP | 300 |
| A | www | Your_Server_IP | 300 |
| A | api | Your_Server_IP | 300 |

---

## 📋 Server Setup Checklist

Before deploying, make sure your server has:

- [ ] Nginx installed
- [ ] SSL certificates (Let's Encrypt)
- [ ] PocketBase service configured
- [ ] Firewall rules set (allow 80, 443)
- [ ] Domain pointing to server

**Server setup guide:** See `DEPLOY_TO_PRODUCTION.md`

---

## 🧪 Testing After Deployment

### 1. Test Frontend
```bash
curl https://bianluns.com
# Should return HTML
```

### 2. Test API
```bash
curl https://api.bianluns.com/api/health
# Should return: {"message":"API is healthy.","code":200}
```

### 3. Test SSL
```bash
curl -I https://bianluns.com
# Should show: HTTP/2 200
```

### 4. Test Admin Dashboard
Open: https://api.bianluns.com/_/
Should show PocketBase admin login

### 5. Test WeChat Login
1. Open: https://bianluns.com/login
2. Click "微信登录"
3. Should show QR code or redirect

---

## 🐛 Troubleshooting

### Frontend not loading
```bash
# Check nginx logs
ssh root@server "tail -f /var/log/nginx/error.log"

# Check file permissions
ssh root@server "ls -la /var/www/bianluns.com"
```

### API not responding
```bash
# Check PocketBase status
ssh root@server "systemctl status pocketbase"

# Check PocketBase logs
ssh root@server "journalctl -u pocketbase -f"
```

### SSL issues
```bash
# Check certificates
ssh root@server "certbot certificates"

# Renew if needed
ssh root@server "certbot renew"
```

---

## 📊 What You Get

After deployment, you'll have:

✅ **Frontend**: https://bianluns.com
- Tournament listings
- User registration/login
- WeChat login ready
- User profiles
- Topic browsing

✅ **Backend**: https://api.bianluns.com
- PocketBase API
- SQLite database
- Built-in admin dashboard
- OAuth2 authentication

✅ **Admin**: https://api.bianluns.com/_/
- Manage users
- Manage tournaments
- Manage topics
- View logs
- Configure OAuth

---

## 💰 Estimated Costs

| Service | Cost |
|---------|------|
| VPS (DigitalOcean/Vultr) | $6/month |
| Domain (already have) | $0 |
| SSL (Let's Encrypt) | Free |
| **Total** | **$6/month** |

---

## 🎉 Next Steps

1. **Deploy now** - Use `./deploy.sh` or manual method
2. **Set up WeChat OAuth** - Get AppID & AppSecret
3. **Configure PocketBase** - Add OAuth provider
4. **Test everything** - Login, tournaments, etc.
5. **Go live!** 🚀

---

## 📚 Documentation

- **DEPLOY_TO_PRODUCTION.md** - Full deployment guide
- **WECHAT_LOGIN_SETUP.md** - WeChat OAuth setup
- **START_POCKETBASE.md** - PocketBase guide
- **deploy.sh** - Automated deployment script

---

## 🆘 Need Help?

If you encounter issues:
1. Check the troubleshooting sections
2. Review server logs
3. Verify DNS settings
4. Check firewall rules
5. Ensure SSL is valid

---

**Ready to deploy?** 

Run: `./deploy.sh` (after editing SERVER_HOST)

Or follow manual steps above!

🎉 **Your app is production-ready!**

