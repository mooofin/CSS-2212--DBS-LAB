import { Router } from 'express';
import pool from '../db/connection.js';

const router = Router();

// GET /api/rooms/summary — room type summary from view
router.get('/summary', async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM v_room_summary');
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

// GET /api/rooms — list all rooms, optional filters ?status=&type=
router.get('/', async (req, res, next) => {
    try {
        let sql = 'SELECT * FROM rooms WHERE 1=1';
        const params = [];

        if (req.query.status) {
            sql += ' AND status = ?';
            params.push(req.query.status);
        }
        if (req.query.type) {
            sql += ' AND type = ?';
            params.push(req.query.type);
        }

        sql += ' ORDER BY room_number ASC';
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

// GET /api/rooms/:id — single room
router.get('/:id', async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM rooms WHERE room_id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Room not found' });
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
});

// POST /api/rooms — create room
router.post('/', async (req, res, next) => {
    try {
        const { room_number, type, price_per_night, status, floor, max_occupancy, amenities } = req.body;
        const [result] = await pool.query(
            `INSERT INTO rooms (room_number, type, price_per_night, status, floor, max_occupancy, amenities)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [room_number, type, price_per_night, status || 'available', floor, max_occupancy, amenities || null]
        );
        const [newRoom] = await pool.query('SELECT * FROM rooms WHERE room_id = ?', [result.insertId]);
        res.status(201).json(newRoom[0]);
    } catch (err) {
        next(err);
    }
});

// PUT /api/rooms/:id — update room
router.put('/:id', async (req, res, next) => {
    try {
        const { room_number, type, price_per_night, status, floor, max_occupancy, amenities } = req.body;
        await pool.query(
            `UPDATE rooms SET room_number = ?, type = ?, price_per_night = ?, status = ?,
       floor = ?, max_occupancy = ?, amenities = ? WHERE room_id = ?`,
            [room_number, type, price_per_night, status, floor, max_occupancy, amenities, req.params.id]
        );
        const [updated] = await pool.query('SELECT * FROM rooms WHERE room_id = ?', [req.params.id]);
        if (updated.length === 0) return res.status(404).json({ error: 'Room not found' });
        res.json(updated[0]);
    } catch (err) {
        next(err);
    }
});

// DELETE /api/rooms/:id — soft delete (set to maintenance)
router.delete('/:id', async (req, res, next) => {
    try {
        const [result] = await pool.query(
            "UPDATE rooms SET status = 'maintenance' WHERE room_id = ?",
            [req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Room not found' });
        res.json({ message: 'Room set to maintenance' });
    } catch (err) {
        next(err);
    }
});

export default router;
