# 🚀 PocketBase Quick Start Guide

## What is PocketBase?

PocketBase is an open-source backend that includes:
- ✅ Built-in SQLite database
- ✅ User authentication
- ✅ Real-time subscriptions
- ✅ File storage
- ✅ Admin dashboard UI
- ✅ REST & Realtime APIs

**No MongoDB needed! Everything in one executable!**

---

## 🎯 How to Start Your Application

### Step 1: Start PocketBase Backend

Open a terminal and run:

```bash
cd /Users/mac/Downloads/bianluns\(9.5:10\)/pocketbase
./pocketbase serve
```

You should see:
```
Server started at http://127.0.0.1:8090
├─ REST API: http://127.0.0.1:8090/api/
└─ Admin UI: http://127.0.0.1:8090/_/
```

**Keep this terminal open!**

---

### Step 2: Set Up Admin Account (First Time Only)

1. Open: **http://127.0.0.1:8090/_/**
2. Create your admin account (email + password)
3. You'll see the PocketBase Admin Dashboard

---

### Step 3: Create Collections (First Time Only)

In the Admin Dashboard, create these collections:

#### 1. **users** collection (should already exist)
- Already configured by PocketBase
- Has email, password, name fields

#### 2. **tournaments** collection
Click "New Collection" and add these fields:
- `name` (Text)
- `title` (Text)
- `description` (Text)
- `startDate` (Text)
- `endDate` (Text)
- `registrationDeadline` (Text)
- `location` (Text)
- `type` (Text)
- `status` (Text)
- `price` (Number)
- `organizer` (Text)
- `contact` (Text)
- `category` (Text)

#### 3. **topics** collection
Click "New Collection" and add these fields:
- `text` (Text)
- `explanation` (Text)
- `area` (Text)
- `language` (Text)
- `tournament` (Text)

---

### Step 4: Start Frontend

Open a **NEW** terminal and run:

```bash
cd /Users/mac/Downloads/bianluns\(9.5:10\)/tournament-frontend
node node_modules/vite/bin/vite.js
```

You should see:
```
VITE ready in xxx ms
➜  Local:   http://localhost:5173/
```

**Keep this terminal open too!**

---

### Step 5: Open Your Application

Go to: **http://localhost:5173**

---

## 🎉 You're All Set!

### What's Working:
- ✅ PocketBase backend (port 8090)
- ✅ Frontend (port 5173)
- ✅ User authentication
- ✅ Tournament management
- ✅ Topic management
- ✅ Admin dashboard
- ✅ No MongoDB needed!
- ✅ No Firebase!
- ✅ No AI features!

---

## 🔧 Useful Commands

### Check if PocketBase is running:
```bash
curl http://127.0.0.1:8090/api/health
```

### Access Admin Dashboard:
```
http://127.0.0.1:8090/_/
```

### Stop PocketBase:
Press `Ctrl+C` in the PocketBase terminal

### Stop Frontend:
Press `Ctrl+C` in the frontend terminal

---

## 📊 PocketBase Features

### Admin Dashboard (http://127.0.0.1:8090/_/)
- View all data
- Create/edit/delete records
- Manage users
- Configure collections
- View logs
- Export/import data

### API Endpoints
- **Auth:** `http://127.0.0.1:8090/api/collections/users/auth-with-password`
- **Tournaments:** `http://127.0.0.1:8090/api/collections/tournaments/records`
- **Topics:** `http://127.0.0.1:8090/api/collections/topics/records`

---

## 🎯 Next Steps

1. ✅ Create admin account
2. ✅ Set up collections
3. ✅ Register a user account
4. ✅ Create some tournaments
5. ✅ Test the application

---

## 💡 Why PocketBase?

| Feature | PocketBase | MongoDB + Express |
|---------|------------|-------------------|
| Setup Time | 1 minute | 30+ minutes |
| Files Needed | 1 executable | Multiple files |
| Admin UI | Built-in | Need to build |
| Real-time | Built-in | Need to add |
| File Storage | Built-in | Need to add |
| Database | SQLite (built-in) | External MongoDB |
| Auth | Built-in | Need to implement |

---

## 🆘 Troubleshooting

### PocketBase won't start?
- Make sure port 8090 is free
- Check if you're in the right directory
- Try: `./pocketbase serve --http=127.0.0.1:8091` (different port)

### Frontend can't connect?
- Make sure PocketBase is running on port 8090
- Check browser console for errors
- Verify PocketBase URL in `/src/services/pocketbase.ts`

### Can't create collections?
- Make sure you're logged into Admin Dashboard
- Go to: http://127.0.0.1:8090/_/
- Click "New Collection"

---

**Status:** ✅ **READY TO USE!** 🎉

**Database:** PocketBase (SQLite)  
**Backend:** PocketBase Server  
**Frontend:** React + Vite  
**No MongoDB, No Firebase, No AI!**

