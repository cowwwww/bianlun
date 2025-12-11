# Firebase to MongoDB Migration Guide

## Overview
This project has been migrated from Firebase to MongoDB. All AI-related features have been removed as requested.

## Changes Made

### 1. Removed AI Features
- ❌ Deleted AI Judge page (`/ai-judge`)
- ❌ Deleted AI Analysis page (`/ai-analysis`)
- ❌ Deleted AI Debate Prep page (`/ai-debate-prep`)
- ❌ Deleted AI Teacher page (`/ai-teacher`)
- ❌ Removed AI Dispute Manager component
- ❌ Removed AI Usage Service
- ❌ Removed AI menu items from navigation

### 2. Database Migration
- ✅ Replaced Firebase with MongoDB
- ✅ MongoDB Connection String: `mongodb+srv://admin:admin123@cluster0.xobl9pr.mongodb.net/?appName=Cluster0`
- ✅ Database Name: `tournament_db`

### 3. Backend API
Created a new Express.js backend server to handle MongoDB operations:
- **Location**: `/backend/server.js`
- **Port**: 3001 (default)
- **Features**:
  - User authentication (register, login, logout)
  - Tournament CRUD operations
  - Topic CRUD operations
  - Subscription management

### 4. Frontend Updates
- ✅ Replaced Firebase Auth with custom auth service
- ✅ Updated all services to use REST API instead of Firestore
- ✅ Removed Firebase SDK dependency
- ✅ Added MongoDB dependency (for backend)

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd tournament-frontend
```

2. Install dependencies (already done):
```bash
npm install --legacy-peer-deps
```

3. Create a `.env` file with:
```
REACT_APP_API_URL=http://localhost:3001/api
```

4. Start the frontend:
```bash
npm run dev
```

## MongoDB Collections

The following collections are used:

1. **users** - User accounts and profiles
   - email, password (hashed), displayName, subscriptionType, etc.

2. **subscriptions** - User subscription information
   - userId, type, status, aiUsageCount, aiUsageLimit, etc.

3. **tournaments** - Tournament data
   - name, description, dates, location, organizer, etc.

4. **topics** - Debate topics
   - text, explanation, area, language, tournament, etc.

5. **resources** - Learning resources (if applicable)

6. **judges** - Judge profiles (if applicable)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Tournaments
- `GET /api/tournaments` - Get all tournaments
- `GET /api/tournaments/:id` - Get tournament by ID
- `POST /api/tournaments` - Create tournament (auth required)
- `PUT /api/tournaments/:id` - Update tournament (auth required)
- `DELETE /api/tournaments/:id` - Delete tournament (auth required)

### Topics
- `GET /api/topics` - Get all topics
- `GET /api/topics/:id` - Get topic by ID
- `POST /api/topics` - Create topic (auth required)
- `PUT /api/topics/:id` - Update topic (auth required)
- `DELETE /api/topics/:id` - Delete topic (auth required)

### Subscriptions
- `GET /api/subscriptions/me` - Get user subscription
- `POST /api/subscriptions/use-token` - Use free download token
- `POST /api/subscriptions/increment-ai-usage` - Increment AI usage (deprecated)

## Authentication

The system now uses JWT (JSON Web Tokens) for authentication:
- Tokens are stored in localStorage
- Tokens expire after 7 days
- Include token in Authorization header: `Bearer <token>`

## Important Notes

1. **MongoDB Connection**: Make sure MongoDB cluster is accessible and credentials are correct
2. **CORS**: Backend is configured to allow all origins for development. Update for production.
3. **JWT Secret**: Change the JWT_SECRET in production for security
4. **Password Security**: Passwords are hashed using bcrypt with 10 salt rounds
5. **AI Features**: All AI-related functionality has been completely removed

## Migration Checklist

- [x] Remove all AI pages and components
- [x] Delete Firebase configuration
- [x] Create MongoDB configuration
- [x] Create backend API server
- [x] Update authentication system
- [x] Update tournament service
- [x] Update topic service
- [x] Update subscription hooks
- [x] Install MongoDB dependencies
- [x] Remove Firebase dependencies
- [ ] Update remaining page files (in progress)
- [ ] Test all functionality
- [ ] Deploy backend server
- [ ] Update environment variables for production

## Next Steps

1. Complete updating all remaining page files that reference Firebase
2. Test all CRUD operations
3. Set up MongoDB indexes for better performance
4. Configure production environment variables
5. Deploy backend to a hosting service (e.g., Heroku, Railway, DigitalOcean)
6. Update frontend API URL to point to production backend

## Troubleshooting

### Backend won't start
- Check if MongoDB connection string is correct
- Ensure MongoDB cluster allows connections from your IP
- Verify all npm packages are installed

### Frontend can't connect to backend
- Ensure backend is running on port 3001
- Check REACT_APP_API_URL in .env file
- Verify CORS is enabled in backend

### Authentication issues
- Clear localStorage and try logging in again
- Check if JWT_SECRET is consistent
- Verify token hasn't expired

## Support

For issues or questions, please refer to the project documentation or contact the development team.

