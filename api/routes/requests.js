import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all requests
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM requests ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

// Get single request by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM requests WHERE id = ?', [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const request = rows[0];

        // Fetch status history
        const [history] = await db.query(
            'SELECT * FROM request_status_history WHERE request_id = ? ORDER BY created_at DESC',
            [req.params.id]
        );

        res.json({ ...request, history });
    } catch (error) {
        console.error('Error fetching request:', error);
        res.status(500).json({ error: 'Failed to fetch request' });
    }
});

// Update request status
router.put('/:id/status', async (req, res) => {
    const { status, label } = req.body;
    const { id } = req.params;

    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Update request status
        await connection.query(
            'UPDATE requests SET status = ? WHERE id = ?',
            [status, id]
        );

        // Add history entry
        await connection.query(
            'INSERT INTO request_status_history (request_id, status, label) VALUES (?, ?, ?)',
            [id, status, label || status] // Use provided label or status as fallback
        );

        await connection.commit();
        res.json({ message: 'Status updated successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    } finally {
        connection.release();
    }
});

// Create new request (Optional, mainly for testing or manual entry)
router.post('/', async (req, res) => {
    try {
        // Implementation for manual request creation if needed
        res.status(501).json({ error: 'Not implemented yet' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create request' });
    }
});

// Delete request
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM requests WHERE id = ?', [req.params.id]);
        res.json({ message: 'Request deleted successfully' });
    } catch (error) {
        console.error('Error deleting request:', error);
        res.status(500).json({ error: 'Failed to delete request' });
    }
});

export default router;
