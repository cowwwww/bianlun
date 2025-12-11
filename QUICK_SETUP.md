# 🚀 Quick Setup Guide - Get Your App Working NOW!

## Problem: Nothing Showing?

PocketBase needs collections to be created first. Here's the fastest way:

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Open PocketBase Admin Dashboard

```
http://127.0.0.1:8090/_/
```

**First time?** Create admin account:
- Email: `admin@example.com`
- Password: `admin123456` (or your own)

---

### Step 2: Create Collections

Click "**New Collection**" and create these:

#### Collection 1: **tournaments**

Click "New Collection" → Name it `tournaments` → Add these fields:

| Field Name | Type | Required |
|------------|------|----------|
| name | Text | Yes |
| title | Text | No |
| description | Text | No |
| startDate | Text | No |
| endDate | Text | No |
| location | Text | No |
| type | Text | No |
| status | Text | No |
| organizer | Text | No |
| contact | Text | No |

**Important:** Go to "API Rules" tab:
- List/Search rule: Set to `@request.auth.id != ""` or leave empty for public
- View rule: Leave empty (public access)
- Click "Save changes"

#### Collection 2: **topics**

Click "New Collection" → Name it `topics` → Add these fields:

| Field Name | Type | Required |
|------------|------|----------|
| text | Text | Yes |
| explanation | Text | No |
| area | Text | No |
| language | Text | No |

**Important:** Set API Rules for public read access (same as above)

---

### Step 3: Add Sample Data

**Option A: Use the Setup Tool**

Open this file in your browser:
```
file:///Users/mac/Downloads/bianluns(9.5:10)/add-sample-data.html
```

Click buttons 1, 2, 3 in order.

**Option B: Manual (via Admin Dashboard)**

Go to Collections → tournaments → "New Record"

Add a tournament:
```
name: 2024全国辩论锦标赛
title: 2024全国辩论锦标赛  
description: 全国最高水平的辩论比赛
startDate: 2024-06-01
endDate: 2024-06-03
location: 北京
type: debate
status: upcoming
organizer: 中国辩论协会
contact: contact@debate.cn
```

---

### Step 4: Check Your App

Go to:
```
http://localhost:5173
```

You should now see tournaments! 🎉

---

## 🔧 Troubleshooting

### Still seeing errors?

1. **Check PocketBase is running:**
```bash
curl http://127.0.0.1:8090/api/health
```

Should return: `{"code":200,"message":"API is healthy."}`

2. **Check collections exist:**

Go to: http://127.0.0.1:8090/_/

You should see `tournaments` and `topics` collections.

3. **Check API Rules:**

Each collection → "API Rules" tab → Make sure List/View rules allow access

4. **Restart frontend:**
```bash
cd /Users/mac/Downloads/bianluns\(9.5:10\)/tournament-frontend
pkill -f vite
node node_modules/vite/bin/vite.js
```

5. **Clear browser cache:**
- Open browser console (F12)
- Right-click refresh button → "Empty Cache and Hard Reload"

---

## 📊 What Collections Do

- **users** - Auto-created by PocketBase, handles login/signup
- **tournaments** - Stores tournament data for homepage
- **topics** - Stores debate topics

---

## 🎯 Quick Test

### Test PocketBase API directly:

```bash
# Get all tournaments
curl http://127.0.0.1:8090/api/collections/tournaments/records

# Should return JSON with tournament data
```

If this returns empty `{"items":[]}`, you need to add data!

---

## ✅ Checklist

- [ ] PocketBase running (port 8090)
- [ ] Admin account created
- [ ] `tournaments` collection created with fields
- [ ] `topics` collection created with fields
- [ ] API Rules set to allow read access
- [ ] Sample tournament added
- [ ] Frontend running (port 5173)
- [ ] Browser cache cleared

Once all checked, you should see data! 🎉

---

## 🚀 After Setup

Your app will show:
- ✅ Tournament listings on homepage
- ✅ Tournament details when clicking
- ✅ User can register/login
- ✅ User profile page
- ✅ Topics page

---

**Need help?** Check: `START_POCKETBASE.md` for detailed guide

