# 🔧 Fix Admin Route Access Issue

## ❌ Problem

Can't access `https://www.bianluns.com/admin` - getting 404 or page not found.

## 🔍 Root Cause

This is a **client-side routing issue**. When you directly access `/admin`, the server tries to find a file at that path, but in a Single Page Application (SPA), all routes are handled by JavaScript. The server needs to be configured to serve `index.html` for all routes.

## ✅ Solutions

### Solution 1: Cloudflare Pages Configuration

If deployed on **Cloudflare Pages**, add this to your build settings:

1. Go to Cloudflare Dashboard → Pages → Your Project → Settings
2. Go to **"Builds & deployments"**
3. Add a **`_redirects`** file or configure in settings:

**Option A: Create `_redirects` file** (already created in `tournament-frontend/_redirects`):
```
/*    /index.html   200
```

**Option B: Use Cloudflare Pages Functions** (create `functions/_middleware.js`):
```javascript
export function onRequest(context) {
  return context.next();
}
```

### Solution 2: Vercel Configuration

If deployed on **Vercel**, the `vercel.json` should already have rewrites. Make sure it's in the **root** of your project:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Important**: If deploying from `tournament-frontend` directory, the `vercel.json` should be in that directory, not the root.

### Solution 3: Nginx Configuration (If using custom server)

If you're using a custom server with Nginx, add this to your config:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Solution 4: Apache Configuration (If using Apache)

If using Apache, create/update `.htaccess` in the `dist` folder:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## 🚀 Quick Fix Steps

### For Cloudflare Pages:

1. **Make sure `_redirects` file is in build output:**
   ```bash
   # The file is already created at:
   # tournament-frontend/_redirects
   ```

2. **Redeploy your site:**
   - Cloudflare Pages will automatically pick up the `_redirects` file
   - Or trigger a new deployment from GitHub

3. **Test:**
   - Go to: `https://www.bianluns.com/admin`
   - Should now work! ✅

### For Vercel:

1. **Check `vercel.json` location:**
   - Should be in `tournament-frontend/` directory
   - Or in root if deploying from root

2. **Redeploy:**
   ```bash
   cd tournament-frontend
   vercel --prod
   ```

## 🧪 Testing

After fixing, test these URLs:

- ✅ `https://www.bianluns.com/` (homepage)
- ✅ `https://www.bianluns.com/admin` (admin page)
- ✅ `https://www.bianluns.com/login` (login page)
- ✅ `https://www.bianluns.com/tournaments/mun` (MUN tournaments)

All should work without 404 errors.

## 📝 Current Route Configuration

Your routes are correctly configured in `App.tsx`:

```tsx
<Route path="/admin" element={<AdminDashboard />} />
```

The issue is server-side routing, not client-side routing.

## 🔍 Debugging

If still not working:

1. **Check browser console** for errors
2. **Check network tab** - see what the server returns for `/admin`
3. **Check deployment logs** - see if build completed successfully
4. **Verify the `_redirects` file** is in the build output

## ✅ Expected Result

After fixing:
- Direct access to `/admin` should work
- All routes should work when accessed directly
- No 404 errors for valid routes

---

**Note**: The `_redirects` file has been created in `tournament-frontend/_redirects`. Make sure it's included in your build output!

