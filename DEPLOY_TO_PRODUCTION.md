# 🚀 Deploy to bianluns.com

## Overview

We'll deploy:
- **Frontend** → bianluns.com
- **PocketBase Backend** → api.bianluns.com (or bianluns.com:8090)

---

## 📋 Prerequisites

1. Domain: bianluns.com
2. Server (VPS) - any of:
   - DigitalOcean Droplet ($6/month)
   - AWS EC2
   - Vultr
   - Linode
   - Or any Linux server

---

## 🎯 Deployment Options

### Option 1: All-in-One (Easiest)
Deploy everything on one server with nginx

### Option 2: Separate Hosting
- Frontend: Vercel/Netlify (free)
- Backend: VPS with PocketBase

---

## 🚀 Option 1: All-in-One Deployment (Recommended)

### Step 1: Prepare Your Server

SSH into your server:
```bash
ssh root@your-server-ip
```

Install required software:
```bash
# Update system
apt update && apt upgrade -y

# Install nginx
apt install nginx -y

# Install certbot for SSL
apt install certbot python3-certbot-nginx -y

# Install Node.js (for building frontend)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install nodejs -y
```

### Step 2: Upload PocketBase

On your local machine:
```bash
# Compress PocketBase
cd /Users/mac/Downloads/bianluns\(9.5:10\)
tar -czf pocketbase-deploy.tar.gz pocketbase/

# Upload to server
scp pocketbase-deploy.tar.gz root@your-server-ip:/opt/
```

On server:
```bash
cd /opt
tar -xzf pocketbase-deploy.tar.gz
chmod +x pocketbase/pocketbase
```

### Step 3: Create PocketBase Service

Create systemd service file:
```bash
nano /etc/systemd/system/pocketbase.service
```

Add this content:
```ini
[Unit]
Description=PocketBase Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/pocketbase
ExecStart=/opt/pocketbase/pocketbase serve --http=127.0.0.1:8090
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Start PocketBase:
```bash
systemctl daemon-reload
systemctl enable pocketbase
systemctl start pocketbase
systemctl status pocketbase
```

### Step 4: Build & Upload Frontend

On your local machine:
```bash
cd /Users/mac/Downloads/bianluns\(9.5:10\)/tournament-frontend

# Update PocketBase URL for production
# Edit src/services/pocketbase.ts and change URL to:
# const pb = new PocketBase('https://api.bianluns.com');

# Build
npm run build

# Upload to server
scp -r dist root@your-server-ip:/var/www/bianluns.com/
```

### Step 5: Configure Nginx

On server:
```bash
nano /etc/nginx/sites-available/bianluns.com
```

Add this configuration:
```nginx
# Frontend - bianluns.com
server {
    listen 80;
    server_name bianluns.com www.bianluns.com;
    
    root /var/www/bianluns.com/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Backend API - api.bianluns.com
server {
    listen 80;
    server_name api.bianluns.com;
    
    location / {
        proxy_pass http://127.0.0.1:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support for PocketBase realtime
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/bianluns.com /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Step 6: Get SSL Certificates

```bash
certbot --nginx -d bianluns.com -d www.bianluns.com -d api.bianluns.com
```

Follow prompts, select redirect HTTP to HTTPS.

### Step 7: Configure DNS

In your domain registrar (GoDaddy, Namecheap, etc.):

Add these A records:
```
bianluns.com        →  Your-Server-IP
www.bianluns.com    →  Your-Server-IP
api.bianluns.com    →  Your-Server-IP
```

Wait 5-15 minutes for DNS to propagate.

---

## 🎯 Option 2: Separate Hosting

### Frontend on Vercel (Free)

1. Push your code to GitHub
2. Go to vercel.com
3. Import your repository
4. Build settings:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
5. Add environment variable:
   - `VITE_POCKETBASE_URL` = `https://your-server-ip:8090`
6. Deploy!
7. Add custom domain: bianluns.com

### Backend on VPS

Follow Steps 1-3 and 5 from Option 1, but:
- Bind PocketBase to `0.0.0.0:8090` instead of `127.0.0.1:8090`
- Configure firewall to allow port 8090
- Get SSL certificate with certbot standalone mode

---

## 🔐 WeChat Login Setup

### Step 1: Register WeChat Open Platform Account

1. Go to: https://open.weixin.qq.com/
2. Register as a developer
3. Create a Website Application
4. Fill in:
   - Website URL: https://bianluns.com
   - Authorization callback: https://bianluns.com/auth/wechat/callback

### Step 2: Get WeChat Credentials

After approval, you'll get:
- AppID
- AppSecret

### Step 3: Update PocketBase Settings

In PocketBase Admin Dashboard:
1. Go to Settings → Auth providers
2. Enable OAuth2
3. Add WeChat provider configuration

### Step 4: Update Frontend Code

I'll create the WeChat login integration files for you.

---

## ✅ Verification Checklist

- [ ] Server accessible via SSH
- [ ] Domain DNS configured
- [ ] PocketBase running on server
- [ ] Frontend built and uploaded
- [ ] Nginx configured
- [ ] SSL certificates installed
- [ ] bianluns.com loads frontend
- [ ] api.bianluns.com/api/health returns healthy
- [ ] WeChat app registered
- [ ] OAuth configured in PocketBase

---

## 🆘 Troubleshooting

### Frontend shows blank page:
```bash
# Check nginx logs
tail -f /var/log/nginx/error.log
```

### PocketBase not responding:
```bash
# Check service status
systemctl status pocketbase

# Check logs
journalctl -u pocketbase -f
```

### SSL issues:
```bash
# Renew certificates
certbot renew --dry-run
```

---

## 📊 Estimated Costs

| Service | Provider | Cost |
|---------|----------|------|
| Server | DigitalOcean | $6/month |
| Domain | Already have | $0 |
| SSL | Let's Encrypt | Free |
| **Total** | | **$6/month** |

---

**Next:** I'll create the WeChat login integration files!

