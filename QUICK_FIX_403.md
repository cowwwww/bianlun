# ⚡ Quick Fix for 403 Forbidden Error

## 🎯 The Problem

Your frontend is getting this error:
```
403 Forbidden: Only superusers can perform this action
```

## ✅ The Solution (Choose One)

### 🚀 Fastest: Use HTML Tool (5 minutes)

1. **Open this file in your browser:**
   ```
   fix-pocketbase-api-rules.html
   ```

2. **Follow the instructions** - it will guide you step-by-step

3. **Done!** Refresh your frontend

---

### 🤖 Automated: Use Script (2 minutes)

```bash
node fix-api-rules.js https://pocketbase-railway-production-d9aa.up.railway.app
```

Enter your admin email/password when prompted.

---

### 📝 Manual: Update Rules Yourself (10 minutes)

1. Go to: `https://pocketbase-railway-production-d9aa.up.railway.app/_/`
2. Login
3. For each collection (tournaments, topics, etc.):
   - Click collection → "API Rules" tab
   - Set **List/Search** and **View** rules to: *(empty)*
   - Set **Create/Update/Delete** rules to: `@request.auth.id != ""`
   - Click "Save changes"

---

## 🎯 Priority Collections (Fix These First)

1. ✅ tournaments
2. ✅ topics  
3. ✅ registrations
4. ✅ judges

---

## ✅ After Fixing

1. Refresh your frontend (Ctrl+F5)
2. Check browser console - 403 error should be gone
3. Tournaments should now load! 🎉

---

**Need more details?** See `FIX_403_ERROR.md`

