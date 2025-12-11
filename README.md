# Tournament Platform

A comprehensive platform for managing student competitions, starting with debate tournaments. This platform allows users to discover, register for, and promote tournaments in one place.

## Features

- User authentication and authorization
- Tournament creation and management
- Tournament registration system
- Resource marketplace for competition materials
- Featured listings for tournament promotion
- Filtering and search capabilities
- Email notifications for upcoming tournaments

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL database
- JWT authentication
- AWS S3 for file storage

### Frontend (Coming Soon)
- React with TypeScript
- Material-UI
- Redux for state management
- React Router for navigation

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd tournament-platform
```

2. Install dependencies:
```bash
cd server
npm install
```

3. Create a PostgreSQL database:
```sql
CREATE DATABASE tournament_platform;
```

4. Create a `.env` file in the server directory with the following variables:
```
PORT=3001
DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=tournament_platform
DB_PASSWORD=your_db_password
DB_PORT=5432
JWT_SECRET=your_jwt_secret_key
```

5. Run database migrations:
```bash
psql -U your_db_user -d tournament_platform -f src/db/schema.sql
```

6. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user

### Tournaments
- GET /api/tournaments - Get all tournaments
- GET /api/tournaments/:id - Get single tournament
- POST /api/tournaments - Create tournament
- PUT /api/tournaments/:id - Update tournament
- DELETE /api/tournaments/:id - Delete tournament

### Registrations
- GET /api/registrations/tournament/:tournamentId - Get tournament registrations
- GET /api/registrations/user/:userId - Get user registrations
- POST /api/registrations - Register for tournament
- PUT /api/registrations/:id - Update registration status
- DELETE /api/registrations/:id - Cancel registration

### Resources
- GET /api/resources/tournament/:tournamentId - Get tournament resources
- GET /api/resources/user/:userId - Get user resources
- POST /api/resources - Upload resource
- PUT /api/resources/:id - Update resource
- DELETE /api/resources/:id - Delete resource
- POST /api/resources/:id/purchase - Purchase resource

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any questions or concerns, please open an issue in the repository. 