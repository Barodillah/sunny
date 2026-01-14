import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET all promos
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM promos ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching promos:', error);
        res.status(500).json({ error: 'Failed to fetch promos' });
    }
});

// GET single promo
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM promos WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Promo not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching promo:', error);
        res.status(500).json({ error: 'Failed to fetch promo' });
    }
});

// POST create promo
router.post('/', async (req, res) => {
    try {
        const { code, title, description, image_url, is_active, start_date, end_date } = req.body;

        const [result] = await pool.query(
            `INSERT INTO promos (code, title, description, image_url, is_active, start_date, end_date) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [code, title, description, image_url, is_active ?? true, start_date, end_date]
        );

        res.status(201).json({
            id: result.insertId,
            code,
            title,
            description,
            image_url,
            is_active: is_active ?? true,
            start_date,
            end_date
        });
    } catch (error) {
        console.error('Error creating promo:', error);
        res.status(500).json({ error: 'Failed to create promo' });
    }
});

// PUT update promo
router.put('/:id', async (req, res) => {
    try {
        const { code, title, description, image_url, is_active, start_date, end_date } = req.body;

        const [result] = await pool.query(
            `UPDATE promos SET code = ?, title = ?, description = ?, image_url = ?, 
             is_active = ?, start_date = ?, end_date = ? WHERE id = ?`,
            [code, title, description, image_url, is_active, start_date, end_date, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Promo not found' });
        }

        res.json({ id: parseInt(req.params.id), code, title, description, image_url, is_active, start_date, end_date });
    } catch (error) {
        console.error('Error updating promo:', error);
        res.status(500).json({ error: 'Failed to update promo' });
    }
});

// DELETE promo
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM promos WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Promo not found' });
        }

        res.json({ message: 'Promo deleted successfully' });
    } catch (error) {
        console.error('Error deleting promo:', error);
        res.status(500).json({ error: 'Failed to delete promo' });
    }
});

export default router;
