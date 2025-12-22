# Tournament Backend API

Backend API server for the Tournament Management System using MongoDB.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional, defaults are set in code):
```bash
cp .env.example .env
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## MongoDB Configuration

- **URI**: `mongodb+srv://admin:admin123@cluster0.xobl9pr.mongodb.net/?appName=Cluster0`
- **Database**: `tournament_db`
- **Username**: `admin`
- **Password**: `admin123`

## API Documentation

Server runs on `http://localhost:3001`

### Authentication Endpoints

#### Register
```
POST /api/auth/register
Body: {
  "email": "user@example.com",
  "password": "password123",
  "displayName": "User Name",
  "wechatId": "optional",
  "phone": "optional"
}
```

#### Login
```
POST /api/auth/login
Body: {
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile
```
GET /api/auth/profile
Headers: {
  "Authorization": "Bearer <token>"
}
```

### Tournament Endpoints

#### Get All Tournaments
```
GET /api/tournaments
```

#### Get Tournament by ID
```
GET /api/tournaments/:id
```

#### Create Tournament
```
POST /api/tournaments
Headers: {
  "Authorization": "Bearer <token>"
}
Body: {
  "name": "Tournament Name",
  "description": "Description",
  "startDate": "2024-01-01",
  "endDate": "2024-01-02",
  ...
}
```

### Topic Endpoints

#### Get All Topics
```
GET /api/topics
```

#### Create Topic
```
POST /api/topics
Headers: {
  "Authorization": "Bearer <token>"
}
Body: {
  "text": "Topic text",
  "explanation": "Explanation",
  "area": "Area",
  "language": "zh",
  "tournament": "Tournament name"
}
```

## Collections

- `users` - User accounts
- `subscriptions` - User subscriptions
- `tournaments` - Tournament data
- `topics` - Debate topics

## Security Notes

⚠️ **Important for Production:**
1. Change JWT_SECRET to a strong random string
2. Configure CORS to only allow your frontend domain
3. Add rate limiting
4. Add input validation
5. Use HTTPS
6. Set up proper MongoDB user roles
7. Enable MongoDB IP whitelist

## Development

The server uses:
- Express.js for API routing
- MongoDB for database
- JWT for authentication
- bcrypt for password hashing
- CORS for cross-origin requests



