import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET all knowledge entries
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM knowledge_base ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching knowledge:', error);
        res.status(500).json({ error: 'Failed to fetch knowledge' });
    }
});

// GET single knowledge entry
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM knowledge_base WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Knowledge not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching knowledge:', error);
        res.status(500).json({ error: 'Failed to fetch knowledge' });
    }
});

// POST create knowledge entry
router.post('/', async (req, res) => {
    try {
        const { title, content, keywords, category, is_active } = req.body;

        const [result] = await pool.query(
            `INSERT INTO knowledge_base (title, content, keywords, category, is_active) 
             VALUES (?, ?, ?, ?, ?)`,
            [title, content, keywords, category, is_active ?? true]
        );

        res.status(201).json({
            id: result.insertId,
            title,
            content,
            keywords,
            category,
            is_active: is_active ?? true
        });
    } catch (error) {
        console.error('Error creating knowledge:', error);
        res.status(500).json({ error: 'Failed to create knowledge' });
    }
});

// PUT update knowledge entry
router.put('/:id', async (req, res) => {
    try {
        const { title, content, keywords, category, is_active } = req.body;

        const [result] = await pool.query(
            `UPDATE knowledge_base SET title = ?, content = ?, keywords = ?, 
             category = ?, is_active = ? WHERE id = ?`,
            [title, content, keywords, category, is_active, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Knowledge not found' });
        }

        res.json({ id: parseInt(req.params.id), title, content, keywords, category, is_active });
    } catch (error) {
        console.error('Error updating knowledge:', error);
        res.status(500).json({ error: 'Failed to update knowledge' });
    }
});

// DELETE knowledge entry
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM knowledge_base WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Knowledge not found' });
        }

        res.json({ message: 'Knowledge deleted successfully' });
    } catch (error) {
        console.error('Error deleting knowledge:', error);
        res.status(500).json({ error: 'Failed to delete knowledge' });
    }
});

export default router;
