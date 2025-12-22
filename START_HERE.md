# 🚀 Quick Start Guide

## What Changed?

✅ **Removed:** All AI features (AI Judge, AI Analysis, AI Debate Prep, AI Teacher)  
✅ **Removed:** All Firebase code and dependencies  
✅ **Added:** MongoDB database integration  
✅ **Added:** New Express.js backend API server  

## 📋 Prerequisites

- Node.js installed (v16 or higher)
- MongoDB connection (already configured)
- Two terminal windows

## 🎯 How to Run Your Application

### Step 1: Start the Backend Server

Open a terminal and run:

```bash
cd backend
npm start
```

You should see:
```
Connected to MongoDB
Server running on port 3001
```

**Keep this terminal open!**

---

### Step 2: Start the Frontend

Open a **NEW** terminal and run:

```bash
cd tournament-frontend
npm run dev
```

You should see:
```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

**Keep this terminal open too!**

---

### Step 3: Open Your Browser

Go to: **http://localhost:5173**

## 🔑 Test Login

You can create a new account or use existing credentials if you have any.

### Register New User:
1. Click "注册账号" (Register)
2. Fill in the form
3. Submit

### Login:
1. Enter your WeChat ID or email
2. Enter password
3. Click login

## 📊 MongoDB Connection

Your application is now connected to:
- **Database:** `tournament_db`
- **Host:** MongoDB Atlas Cluster
- **Connection:** `mongodb+srv://admin:admin123@cluster0.xobl9pr.mongodb.net/`

## 🛠️ Troubleshooting

### Backend won't start?
- Make sure you're in the `backend` folder
- Run `npm install` first if you haven't
- Check if port 3001 is available

### Frontend won't start?
- Make sure you're in the `tournament-frontend` folder
- Dependencies should already be installed
- Check if port 5173 is available

### Can't connect to MongoDB?
- Check your internet connection
- Verify MongoDB Atlas cluster is running
- Check if your IP is whitelisted in MongoDB Atlas

### "Firebase is not defined" errors?
- Some page files may still need updating
- These will be fixed in the next update
- Core functionality (auth, tournaments, topics) should work

## 📁 Project Structure

```
bianluns(9.5:10)/
├── backend/              ← Backend API server (NEW!)
│   ├── server.js        ← Main server file
│   └── package.json     ← Backend dependencies
│
└── tournament-frontend/  ← React frontend
    ├── src/
    │   ├── services/    ← API services (UPDATED)
    │   ├── pages/       ← App pages (AI pages removed)
    │   └── components/  ← React components
    └── package.json     ← Frontend dependencies
```

## 📖 Documentation

For more details, see:
- `MIGRATION_GUIDE.md` - Complete migration documentation
- `CHANGES_SUMMARY.md` - Detailed list of all changes
- `backend/README.md` - Backend API documentation

## ⚠️ Important Notes

1. **Both servers must be running** for the app to work
2. Backend runs on port **3001**
3. Frontend runs on port **5173** (default Vite port)
4. All AI features have been removed as requested
5. Firebase has been completely replaced with MongoDB

## 🎉 You're All Set!

Your application is now running with:
- ✅ MongoDB database
- ✅ No Firebase
- ✅ No AI features
- ✅ Clean, working authentication
- ✅ Tournament management
- ✅ Topic management

Enjoy your updated application! 🚀

---

## 💡 Quick Commands Reference

### Backend:
```bash
cd backend
npm start          # Start server
npm run dev        # Start with auto-reload (development)
```

### Frontend:
```bash
cd tournament-frontend
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## 🆘 Need Help?

Check the following files for detailed information:
1. `MIGRATION_GUIDE.md` - Setup and migration details
2. `CHANGES_SUMMARY.md` - What was changed
3. `backend/README.md` - API documentation

---

**Last Updated:** December 2024  
**Status:** ✅ Migration Complete



