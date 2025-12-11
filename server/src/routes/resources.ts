import express from 'express';
import { pool } from '../index';
import { Request, Response } from 'express';

const router = express.Router();

// Get all resources for a tournament
router.get('/tournament/:tournamentId', async (req: Request, res: Response) => {
    try {
        const { tournamentId } = req.params;
        const resources = await pool.query(
            `SELECT r.*, u.full_name as uploader_name 
             FROM resources r 
             JOIN users u ON r.uploader_id = u.id 
             WHERE r.tournament_id = $1`,
            [tournamentId]
        );
        res.json(resources.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all resources uploaded by a user
router.get('/user/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const resources = await pool.query(
            `SELECT r.*, t.title as tournament_title 
             FROM resources r 
             JOIN tournaments t ON r.tournament_id = t.id 
             WHERE r.uploader_id = $1`,
            [userId]
        );
        res.json(resources.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Upload a resource
router.post('/', async (req: Request, res: Response) => {
    try {
        const {
            title,
            description,
            file_url,
            tournament_id,
            uploader_id,
            price
        } = req.body;

        const newResource = await pool.query(
            `INSERT INTO resources (
                title, description, file_url, tournament_id,
                uploader_id, price
            ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [title, description, file_url, tournament_id, uploader_id, price]
        );

        res.status(201).json(newResource.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a resource
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            file_url,
            price
        } = req.body;

        const updatedResource = await pool.query(
            `UPDATE resources SET
                title = $1,
                description = $2,
                file_url = $3,
                price = $4,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $5 RETURNING *`,
            [title, description, file_url, price, id]
        );

        if (updatedResource.rows.length === 0) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        res.json(updatedResource.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a resource
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedResource = await pool.query(
            'DELETE FROM resources WHERE id = $1 RETURNING *',
            [id]
        );

        if (deletedResource.rows.length === 0) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Purchase a resource
router.post('/:id/purchase', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { buyer_id } = req.body;

        // Get resource details
        const resource = await pool.query(
            'SELECT * FROM resources WHERE id = $1',
            [id]
        );

        if (resource.rows.length === 0) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // Check if already purchased
        const existingPurchase = await pool.query(
            'SELECT * FROM resource_purchases WHERE resource_id = $1 AND buyer_id = $2',
            [id, buyer_id]
        );

        if (existingPurchase.rows.length > 0) {
            return res.status(400).json({ message: 'Resource already purchased' });
        }

        // Create purchase record
        const purchase = await pool.query(
            'INSERT INTO resource_purchases (resource_id, buyer_id, amount_paid) VALUES ($1, $2, $3) RETURNING *',
            [id, buyer_id, resource.rows[0].price]
        );

        res.status(201).json(purchase.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router; 