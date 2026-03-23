import { Router } from 'express';
import pool from '../db/connection.js';

const router = Router();

// GET /api/bookings/availability?check_in=DATE&check_out=DATE
router.get('/availability', async (req, res, next) => {
    try {
        const { check_in, check_out } = req.query;
        if (!check_in || !check_out) {
            return res.status(400).json({ error: 'check_in and check_out query params are required' });
        }
        const [rows] = await pool.query(
            `SELECT * FROM rooms
       WHERE status != 'maintenance'
       AND room_id NOT IN (
         SELECT room_id FROM bookings
         WHERE status NOT IN ('cancelled','checked_out')
         AND check_in < ? AND check_out > ?
       )
       ORDER BY type, room_number`,
            [check_out, check_in]
        );
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

// GET /api/bookings — list all from v_booking_details, optional ?status=
router.get('/', async (req, res, next) => {
    try {
        let sql = 'SELECT * FROM v_booking_details WHERE 1=1';
        const params = [];

        if (req.query.status) {
            sql += ' AND booking_status = ?';
            params.push(req.query.status);
        }

        sql += ' ORDER BY booking_created DESC';
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

// GET /api/bookings/:id — single booking with full details
router.get('/:id', async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM v_booking_details WHERE booking_id = ?',
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
});

// POST /api/bookings — create booking (validates room availability)
router.post('/', async (req, res, next) => {
    try {
        const { guest_id, room_id, check_in, check_out, adults, children, special_requests } = req.body;

        // Validate room availability for the date range
        const [available] = await pool.query(
            `SELECT * FROM rooms
       WHERE room_id = ?
       AND room_id NOT IN (
         SELECT room_id FROM bookings
         WHERE status NOT IN ('cancelled','checked_out')
         AND check_in < ? AND check_out > ?
       )`,
            [room_id, check_out, check_in]
        );

        if (available.length === 0) {
            return res.status(400).json({ error: 'Room is not available for the selected dates' });
        }

        const [result] = await pool.query(
            `INSERT INTO bookings (guest_id, room_id, check_in, check_out, adults, children, special_requests)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [guest_id, room_id, check_in, check_out, adults || 1, children || 0, special_requests || null]
        );

        const [newBooking] = await pool.query(
            'SELECT * FROM v_booking_details WHERE booking_id = ?',
            [result.insertId]
        );
        res.status(201).json(newBooking[0]);
    } catch (err) {
        next(err);
    }
});

// PUT /api/bookings/:id/checkin
router.put('/:id/checkin', async (req, res, next) => {
    try {
        const [result] = await pool.query(
            "UPDATE bookings SET status = 'checked_in' WHERE booking_id = ? AND status = 'confirmed'",
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Booking not found or not in confirmed status' });
        }
        const [updated] = await pool.query(
            'SELECT * FROM v_booking_details WHERE booking_id = ?',
            [req.params.id]
        );
        res.json(updated[0]);
    } catch (err) {
        next(err);
    }
});

// PUT /api/bookings/:id/checkout
router.put('/:id/checkout', async (req, res, next) => {
    try {
        const [result] = await pool.query(
            "UPDATE bookings SET status = 'checked_out' WHERE booking_id = ? AND status = 'checked_in'",
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Booking not found or not checked in' });
        }
        const [updated] = await pool.query(
            'SELECT * FROM v_booking_details WHERE booking_id = ?',
            [req.params.id]
        );
        res.json(updated[0]);
    } catch (err) {
        next(err);
    }
});

// PUT /api/bookings/:id/cancel
router.put('/:id/cancel', async (req, res, next) => {
    try {
        const [result] = await pool.query(
            "UPDATE bookings SET status = 'cancelled' WHERE booking_id = ? AND status IN ('confirmed')",
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Booking not found or cannot be cancelled' });
        }
        const [updated] = await pool.query(
            'SELECT * FROM v_booking_details WHERE booking_id = ?',
            [req.params.id]
        );
        res.json(updated[0]);
    } catch (err) {
        next(err);
    }
});

export default router;
