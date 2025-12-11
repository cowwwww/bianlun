import express from 'express';
import { pool } from '../index';
import { Request, Response } from 'express';

const router = express.Router();

// Get all registrations for a tournament
router.get('/tournament/:tournamentId', async (req: Request, res: Response) => {
    try {
        const { tournamentId } = req.params;
        const registrations = await pool.query(
            `SELECT r.*, u.full_name, u.institution 
             FROM registrations r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.tournament_id = $1`,
            [tournamentId]
        );
        res.json(registrations.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all registrations for a user
router.get('/user/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const registrations = await pool.query(
            `SELECT r.*, t.title, t.start_date, t.end_date 
             FROM registrations r 
             JOIN tournaments t ON r.tournament_id = t.id 
             WHERE r.user_id = $1`,
            [userId]
        );
        res.json(registrations.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Register for a tournament
router.post('/', async (req: Request, res: Response) => {
    try {
        const { tournament_id, user_id, team_name } = req.body;

        // Check if tournament exists and is open for registration
        const tournament = await pool.query(
            'SELECT * FROM tournaments WHERE id = $1',
            [tournament_id]
        );

        if (tournament.rows.length === 0) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        if (tournament.rows[0].registration_deadline < new Date()) {
            return res.status(400).json({ message: 'Registration deadline has passed' });
        }

        // Check if user is already registered
        const existingRegistration = await pool.query(
            'SELECT * FROM registrations WHERE tournament_id = $1 AND user_id = $2',
            [tournament_id, user_id]
        );

        if (existingRegistration.rows.length > 0) {
            return res.status(400).json({ message: 'Already registered for this tournament' });
        }

        // Check if tournament is full
        const registrationCount = await pool.query(
            'SELECT COUNT(*) FROM registrations WHERE tournament_id = $1',
            [tournament_id]
        );

        if (tournament.rows[0].max_participants && 
            registrationCount.rows[0].count >= tournament.rows[0].max_participants) {
            return res.status(400).json({ message: 'Tournament is full' });
        }

        // Create registration
        const newRegistration = await pool.query(
            'INSERT INTO registrations (tournament_id, user_id, team_name) VALUES ($1, $2, $3) RETURNING *',
            [tournament_id, user_id, team_name]
        );

        res.status(201).json(newRegistration.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update registration status
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedRegistration = await pool.query(
            'UPDATE registrations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (updatedRegistration.rows.length === 0) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        res.json(updatedRegistration.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Cancel registration
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedRegistration = await pool.query(
            'DELETE FROM registrations WHERE id = $1 RETURNING *',
            [id]
        );

        if (deletedRegistration.rows.length === 0) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        res.json({ message: 'Registration cancelled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router; 