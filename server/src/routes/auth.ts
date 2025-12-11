import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../index';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, full_name, institution } = req.body;
        
        // Check if user already exists
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = await pool.query(
            'INSERT INTO users (email, password_hash, full_name, institution) VALUES ($1, $2, $3, $4) RETURNING *',
            [email, password_hash, full_name, institution]
        );

        // Create JWT token
        const token = jwt.sign(
            { id: newUser.rows[0].id },
            process.env.JWT_SECRET || 'your_jwt_secret_key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: newUser.rows[0].id,
                email: newUser.rows[0].email,
                full_name: newUser.rows[0].full_name,
                institution: newUser.rows[0].institution
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user.rows[0].id },
            process.env.JWT_SECRET || 'your_jwt_secret_key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.rows[0].id,
                email: user.rows[0].email,
                full_name: user.rows[0].full_name,
                institution: user.rows[0].institution
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router; 