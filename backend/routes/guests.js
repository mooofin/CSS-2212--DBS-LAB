import { Router } from 'express';
import pool from '../db/connection.js';

const router = Router();

// GET /api/guests — list all guests, optional ?search=name_or_email
router.get('/', async (req, res, next) => {
    try {
        let sql = 'SELECT * FROM guests';
        const params = [];

        if (req.query.search) {
            sql += ` WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?
               OR CONCAT(first_name, ' ', last_name) LIKE ?`;
            const term = `%${req.query.search}%`;
            params.push(term, term, term, term);
        }

        sql += ' ORDER BY created_at DESC';
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

// GET /api/guests/:id — single guest + booking history
router.get('/:id', async (req, res, next) => {
    try {
        const [guests] = await pool.query('SELECT * FROM guests WHERE guest_id = ?', [req.params.id]);
        if (guests.length === 0) return res.status(404).json({ error: 'Guest not found' });

        const [bookings] = await pool.query(
            `SELECT b.booking_id, b.check_in, b.check_out, b.status,
              r.room_number, r.type AS room_type,
              bl.total_amount, bl.payment_status
       FROM bookings b
       JOIN rooms r ON b.room_id = r.room_id
       LEFT JOIN billing bl ON b.booking_id = bl.booking_id
       WHERE b.guest_id = ?
       ORDER BY b.check_in DESC`,
            [req.params.id]
        );

        res.json({ ...guests[0], bookings });
    } catch (err) {
        next(err);
    }
});

// POST /api/guests — create guest
router.post('/', async (req, res, next) => {
    try {
        const { first_name, last_name, email, phone, address, id_type, id_number } = req.body;
        const [result] = await pool.query(
            `INSERT INTO guests (first_name, last_name, email, phone, address, id_type, id_number)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [first_name, last_name, email, phone || null, address || null, id_type || null, id_number || null]
        );
        const [newGuest] = await pool.query('SELECT * FROM guests WHERE guest_id = ?', [result.insertId]);
        res.status(201).json(newGuest[0]);
    } catch (err) {
        next(err);
    }
});

// PUT /api/guests/:id — update guest
router.put('/:id', async (req, res, next) => {
    try {
        const { first_name, last_name, email, phone, address, id_type, id_number } = req.body;
        await pool.query(
            `UPDATE guests SET first_name = ?, last_name = ?, email = ?, phone = ?,
       address = ?, id_type = ?, id_number = ? WHERE guest_id = ?`,
            [first_name, last_name, email, phone, address, id_type, id_number, req.params.id]
        );
        const [updated] = await pool.query('SELECT * FROM guests WHERE guest_id = ?', [req.params.id]);
        if (updated.length === 0) return res.status(404).json({ error: 'Guest not found' });
        res.json(updated[0]);
    } catch (err) {
        next(err);
    }
});

// DELETE /api/guests/:id — delete only if no active bookings
router.delete('/:id', async (req, res, next) => {
    try {
        const [active] = await pool.query(
            `SELECT COUNT(*) AS count FROM bookings
       WHERE guest_id = ? AND status IN ('confirmed', 'checked_in')`,
            [req.params.id]
        );
        if (active[0].count > 0) {
            return res.status(400).json({ error: 'Cannot delete guest with active bookings' });
        }
        const [result] = await pool.query('DELETE FROM guests WHERE guest_id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Guest not found' });
        res.json({ message: 'Guest deleted' });
    } catch (err) {
        next(err);
    }
});

export default router;
