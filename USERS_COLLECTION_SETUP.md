# 👤 Users Collection - Simplified Setup

## ✅ Use ONLY These 3 Fields

Your users collection should have **only**:
1. WeChat ID (username)
2. Password
3. Full Name

---

## 🔧 PocketBase Setup

### Step 1: Collection Type

**IMPORTANT:** Select **"Auth collection"** (not Base!)

---

### Step 2: Configure Fields

After creating the Auth collection, you'll have these **automatic fields**:
- `id` (auto-generated)
- `email` (auto-generated, required by PocketBase)
- `username` (will store WeChat ID)
- `password` (auto-hashed)
- `created`, `updated` (timestamps)

---

### Step 3: Add Custom Fields

Click **"+ New field"** and add:

| Field Name | Type | Required | Unique | Notes |
|------------|------|----------|--------|-------|
| **full_name** | Text | ✅ Yes | ❌ No | User's display name |
| **wechat_id** | Text | ✅ Yes | ✅ Yes | WeChat ID (unique identifier) |

**Delete these fields if they exist:**
- ❌ avatar
- ❌ phone
- ❌ wechatOpenid
- ❌ wechatUnionid
- ❌ name

---

### Step 4: API Rules

Go to **"API Rules"** tab:

| Rule | Value |
|------|-------|
| **List/Search** | `@request.auth.id != ""` |
| **View** | `@request.auth.id != ""` |
| **Create** | Leave empty (allow signup) |
| **Update** | `@request.auth.id = id` |
| **Delete** | `@request.auth.id = id` |

---

### Step 5: Save

Click **"Save changes"**

---

## ✅ Final Structure

Your Users collection will have:

**System fields (auto-created):**
- `id`
- `email` (used internally by PocketBase)
- `username` (stores WeChat ID)
- `password` (hashed)
- `created`
- `updated`

**Your custom fields:**
- `full_name` ✅
- `wechat_id` ✅

**That's it! Only 2 custom fields!**

---

## 🚀 How It Works

### Signup:
```
User enters:
  - Full Name: "Qianhui Cao"
  - WeChat ID: "cqhcqh09"
  - Password: "******"

System stores:
  - username: "cqhcqh09"
  - email: "cqhcqh09" (internal use only)
  - password: (hashed)
  - full_name: "Qianhui Cao"
  - wechat_id: "cqhcqh09"
```

### Login:
```
User enters:
  - WeChat ID: "cqhcqh09"
  - Password: "******"

System authenticates with:
  - username: "cqhcqh09"
  - password: (checks hash)
```

---

## 📝 Summary

**Before:** Complex email generation, multiple unnecessary fields
**After:** Simple WeChat ID + Password + Name

**What users see:** Only WeChat ID (no emails!)
**What PocketBase needs:** Uses WeChat ID as both username and email

✅ Clean
✅ Simple
✅ No confusion!

---

**Next:** Create the other 3 collections (tournaments, topics, timer_projects)



