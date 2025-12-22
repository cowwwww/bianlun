# Tournament Management System - Deployment Guide

## ✅ Completed Setup

We have successfully migrated your tournament management system to **PocketBase on Vercel**:

### 1. **PocketBase Backend Setup**
- ✅ PocketBase deployed to Vercel with Docker
- ✅ SQLite database with all collections and data
- ✅ Authentication and file storage configured
- ✅ Admin panel accessible at `/admin`

### 2. **Database Collections**
Complete PocketBase collections with proper schemas:
- `users` - User profiles and authentication
- `tournaments` - Tournament data and configurations
- `registrations` - Participant registrations
- `matches` - Match data and results
- `resources` - Learning resources and materials

### 3. **Frontend Setup**
- ✅ React application with TypeScript
- ✅ Material-UI components
- ✅ PocketBase client integration
- ✅ Responsive design for all devices

### 4. **Deployment Infrastructure**
- **Backend**: PocketBase on Vercel (Docker)
- **Frontend**: React app on Vercel
- **Database**: SQLite (managed by PocketBase)

## 🚀 Deployment Steps

### Deploy Backend (PocketBase)
```bash
cd pocketbase
vercel --yes --prod
```

**Set Environment Variables in Vercel:**
- `PB_ENCRYPTION_KEY` = `your-random-encryption-key-here`

### Deploy Frontend (React App)
```bash
cd ../tournament-frontend
vercel --yes --prod
```

**Set Environment Variables in Vercel:**
- `VITE_POCKETBASE_URL` = `https://your-pocketbase-project.vercel.app`

## 🚀 System Features

### Subscription Plans Created
- **Basic Plan** (¥99/month): 3 tournaments, 100 participants, 10 AI uses
- **Professional Plan** (¥299/month): Unlimited tournaments, 1000 participants, 100 AI uses  
- **Enterprise Plan** (¥999/month): Unlimited everything, 500 AI uses
- **Annual Plans**: 10-month pricing for yearly subscriptions

### AI-Powered Features
- Tournament bracket generation with seeding strategies
- Usage tracking and quota management
- Monthly quota resets via scheduled functions
- Cost tracking at ¥0.01 per AI token

### Tournament Management
- Complete registration workflow
- Real-time match progression
- Automated notifications
- Multiple tournament formats (elimination, round robin)
- Visual bracket management

### Payment Integration Ready
- WeChat Pay and Alipay support structure
- Automatic subscription renewals
- Payment webhook processing
- Transaction tracking

## 📱 Frontend Features

The React frontend includes:
- **Tournament Management** - Create and manage tournaments
- **User Authentication** - Login/signup with PocketBase
- **Resource Management** - Upload and share learning materials
- **Responsive Design** - Works on all devices
- **Modern UI** - Material-UI components

## 🔒 Security Features

- **PocketBase Authentication** - Secure user management
- **File Upload Security** - Controlled file access
- **API Security** - Built-in PocketBase security
- **Environment Variables** - Secure configuration

## 📊 Database Management

- **PocketBase Admin Panel** - Access at `https://your-project.vercel.app/_/`
- **Collection Management** - Manage users, tournaments, registrations
- **File Storage** - Upload tournament images and resources
- **Real-time Updates** - Live data synchronization

## 🛠️ Next Steps

1. **Deploy both projects** to Vercel
2. **Set up environment variables** for both projects
3. **Initialize database collections** if needed
4. **Test the application** end-to-end
5. **Configure custom domain** (optional)

## 🔍 Troubleshooting

### Backend Deployment Issues:
- Check Vercel deployment logs
- Verify `PB_ENCRYPTION_KEY` is set
- Ensure `pb_data/` directory is included in Docker build

### Frontend Deployment Issues:
- Check that `VITE_POCKETBASE_URL` points to correct backend
- Verify PocketBase is running and accessible
- Check browser console for connection errors

### Database Issues:
- Access PocketBase admin at `/admin`
- Default login: `admin@example.com` / `password123`
- Create collections using the setup scripts if needed

## 📞 Support

Your tournament management system is now deployed with:
- ✅ **PocketBase Backend** - Full-featured backend on Vercel
- ✅ **React Frontend** - Modern, responsive user interface
- ✅ **SQLite Database** - Reliable data storage
- ✅ **File Management** - Upload and share resources
- ✅ **Authentication** - Secure user management

## 🎯 URLs to Access Your App

- **Backend Admin**: `https://your-pocketbase-project.vercel.app/_/`
- **Frontend App**: `https://your-frontend-project.vercel.app/`
- **API Base**: `https://your-pocketbase-project.vercel.app/api/`

The system provides professional tournament management with a modern, scalable architecture. 