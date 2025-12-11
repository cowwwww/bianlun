import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
    user?: {
        id: number;
    };
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new Error();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key') as { id: number };
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

export const isOrganizer = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { pool } = require('../index');
        const user = await pool.query(
            'SELECT role FROM users WHERE id = $1',
            [req.user?.id]
        );

        if (user.rows[0].role !== 'organizer') {
            return res.status(403).json({ message: 'Access denied. Organizer role required.' });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}; 