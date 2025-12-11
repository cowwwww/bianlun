import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

// Import routes
import authRoutes from './routes/auth';
import tournamentRoutes from './routes/tournaments';
import registrationRoutes from './routes/registrations';
import resourceRoutes from './routes/resources';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database configuration
export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/resources', resourceRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Tournament Platform API' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 