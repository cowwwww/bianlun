# 🔐 WeChat Login Setup Guide

## Overview

WeChat login integration for bianluns.com using PocketBase OAuth2.

---

## 📋 Step 1: Register WeChat Open Platform Account

### 1.1 Go to WeChat Open Platform
https://open.weixin.qq.com/

### 1.2 Register Developer Account
- Click "注册" (Register)
- Choose "网站应用开发" (Website Application Development)
- Fill in company/organization information
- Wait for verification (usually 1-3 days)

### 1.3 Create Website Application
After account is verified:
1. Login to WeChat Open Platform
2. Go to "管理中心" (Management Center)
3. Click "创建网站应用" (Create Website Application)
4. Fill in application details:
   - **Application Name**: 云赛
   - **Application Description**: 辩论赛事管理平台
   - **Application Website**: https://bianluns.com
   - **Authorization Callback Domain**: bianluns.com
   - Upload required documents

### 1.4 Get Credentials
After approval, you'll receive:
- **AppID**: Your WeChat App ID
- **AppSecret**: Your WeChat App Secret

📝 **Save these credentials securely!**

---

## 🔧 Step 2: Configure PocketBase

### 2.1 Access PocketBase Admin Dashboard
https://api.bianluns.com/_/
(or your PocketBase URL)

### 2.2 Configure OAuth2 Provider

1. Go to **Settings** → **Auth providers**

2. Click **"Add new provider"**

3. Select **"OAuth2"** and configure:

```
Name: wechat
Display Name: WeChat
Client ID: [Your WeChat AppID]
Client Secret: [Your WeChat AppSecret]
Authorization URL: https://open.weixin.qq.com/connect/qrconnect
Token URL: https://api.weixin.qq.com/sns/oauth2/access_token
User API URL: https://api.weixin.qq.com/sns/userinfo
```

4. Configure **Scopes**: `snsapi_login`

5. Save the configuration

---

## 💻 Step 3: Update Frontend Code

### 3.1 Add WeChat Login Button to Login Page

Edit `src/pages/LoginPage.tsx`:

```typescript
// Add this import at the top
import WeChatLogin from '../components/WeChatLogin';
import { Divider } from '@mui/material';

// Add this before the closing </Container> tag:
<Divider sx={{ my: 3 }}>或</Divider>

<WeChatLogin 
  onError={(error) => setError(error)}
/>
```

### 3.2 Files Already Created

I've already created these files for you:
- ✅ `src/components/WeChatLogin.tsx` - WeChat login button
- ✅ `src/pages/WeChatCallback.tsx` - OAuth callback handler
- ✅ Route added to `App.tsx`

---

## 🚀 Step 4: Deploy to Production

### 4.1 Build Frontend with Production Settings

```bash
cd /Users/mac/Downloads/bianluns\(9.5:10\)/tournament-frontend

# Build for production
npm run build

# The build will use .env.production settings
# PocketBase URL will be: https://api.bianluns.com
```

### 4.2 Upload to Server

```bash
# Upload dist folder to your server
scp -r dist/* root@your-server:/var/www/bianluns.com/
```

### 4.3 Restart Services

On your server:
```bash
# Restart nginx
systemctl reload nginx

# Restart PocketBase (if needed)
systemctl restart pocketbase
```

---

## 🧪 Step 5: Test WeChat Login

### 5.1 Prerequisites
- Domain must be live: https://bianluns.com
- SSL certificate must be valid
- WeChat app must be approved

### 5.2 Testing Flow

1. Go to: https://bianluns.com/login

2. Click "微信登录" (WeChat Login) button

3. You'll see WeChat QR code

4. Scan QR code with WeChat app on your phone

5. Authorize on your phone

6. You'll be redirected back to bianluns.com

7. You're logged in! ✅

---

## 📱 WeChat Login Flow

```
User clicks "微信登录"
    ↓
Frontend redirects to WeChat OAuth
    ↓
User scans QR code with WeChat
    ↓
WeChat redirects to: bianluns.com/auth/wechat/callback?code=xxx
    ↓
Frontend exchanges code for user token
    ↓
PocketBase creates/logs in user
    ↓
User redirected to profile page
```

---

## 🔐 Security Notes

1. **HTTPS Required**: WeChat OAuth only works with HTTPS
2. **Domain Verification**: Must match registered domain
3. **AppSecret**: Never expose in frontend code (PocketBase handles it)
4. **Callback URL**: Must match exactly

---

## 🐛 Troubleshooting

### "redirect_uri parameter error"
- Check callback domain in WeChat Open Platform matches exactly
- Make sure it's just the domain, not full URL
- Example: `bianluns.com` not `https://bianluns.com/callback`

### QR Code doesn't appear
- Check if WeChat provider is enabled in PocketBase
- Verify AppID and AppSecret are correct
- Check browser console for errors

### Login successful but user not created
- Check PocketBase logs
- Verify user collection permissions
- Check if email is required (WeChat doesn't provide email)

### CORS errors
- PocketBase CORS should allow your frontend domain
- Check PocketBase settings → CORS origins

---

## 📊 WeChat User Data

When user logs in with WeChat, you'll get:
- `openid` - Unique WeChat user ID
- `nickname` - User's WeChat nickname
- `headimgurl` - User's avatar
- `province` - User's province
- `city` - User's city
- `country` - User's country

PocketBase will automatically create a user account with this data.

---

## 💡 Additional Features

### Link WeChat to Existing Account

You can add functionality to link WeChat to existing email accounts:

```typescript
// In user profile page
const linkWeChat = async () => {
  const authMethods = await pb.collection('users').listAuthMethods();
  const wechatProvider = authMethods.authProviders.find(p => p.name === 'wechat');
  
  // Start OAuth flow
  window.location.href = wechatProvider.authUrl + redirectUrl;
};
```

### Unlink WeChat

```typescript
const unlinkWeChat = async () => {
  await pb.collection('users').update(userId, {
    'oauth2_wechat': null
  });
};
```

---

## 📝 Checklist

Before going live:
- [ ] WeChat Open Platform account verified
- [ ] Website application created and approved
- [ ] AppID and AppSecret obtained
- [ ] PocketBase OAuth2 configured
- [ ] Frontend built with production settings
- [ ] Deployed to https://bianluns.com
- [ ] SSL certificate valid
- [ ] Tested WeChat login flow
- [ ] User creation working
- [ ] Redirect working correctly

---

## 🎯 Next Steps

1. **Deploy to production** (see DEPLOY_TO_PRODUCTION.md)
2. **Configure WeChat OAuth** in PocketBase Admin
3. **Test login** with WeChat app
4. **Monitor logs** for any issues

---

**Ready to deploy?** Follow DEPLOY_TO_PRODUCTION.md next!
