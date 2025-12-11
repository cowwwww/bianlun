import express from 'express';
import { pool } from '../index';
import { Request, Response } from 'express';

const router = express.Router();

// Get all tournaments
router.get('/', async (req: Request, res: Response) => {
    try {
        const { category, format, language } = req.query;
        let query = 'SELECT * FROM tournaments WHERE 1=1';
        const params: any[] = [];

        if (category) {
            query += ' AND category = $1';
            params.push(category);
        }
        if (format) {
            query += ` AND format = $${params.length + 1}`;
            params.push(format);
        }
        if (language) {
            query += ` AND language = $${params.length + 1}`;
            params.push(language);
        }

        query += ' ORDER BY start_date ASC';
        const tournaments = await pool.query(query, params);
        res.json(tournaments.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single tournament
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const tournament = await pool.query(
            'SELECT * FROM tournaments WHERE id = $1',
            [id]
        );

        if (tournament.rows.length === 0) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        res.json(tournament.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create tournament
router.post('/', async (req: Request, res: Response) => {
    try {
        const {
            title,
            description,
            start_date,
            end_date,
            location,
            format,
            category,
            language,
            cost,
            registration_deadline,
            max_participants,
            organizer_id,
            reward
        } = req.body;

        const newTournament = await pool.query(
            `INSERT INTO tournaments (
                title, description, start_date, end_date, location,
                format, category, language, cost, registration_deadline,
                max_participants, organizer_id, reward
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
            [
                title, description, start_date, end_date, location,
                format, category, language, cost, registration_deadline,
                max_participants, organizer_id, reward
            ]
        );

        res.status(201).json(newTournament.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update tournament
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            start_date,
            end_date,
            location,
            format,
            category,
            language,
            cost,
            registration_deadline,
            max_participants,
            status
        } = req.body;

        const updatedTournament = await pool.query(
            `UPDATE tournaments SET
                title = $1,
                description = $2,
                start_date = $3,
                end_date = $4,
                location = $5,
                format = $6,
                category = $7,
                language = $8,
                cost = $9,
                registration_deadline = $10,
                max_participants = $11,
                status = $12,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $13 RETURNING *`,
            [
                title, description, start_date, end_date, location,
                format, category, language, cost, registration_deadline,
                max_participants, status, id
            ]
        );

        if (updatedTournament.rows.length === 0) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        res.json(updatedTournament.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete tournament
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedTournament = await pool.query(
            'DELETE FROM tournaments WHERE id = $1 RETURNING *',
            [id]
        );

        if (deletedTournament.rows.length === 0) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        res.json({ message: 'Tournament deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router; 