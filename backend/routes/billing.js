import { Router } from 'express';
import pool from '../db/connection.js';

const router = Router();

// GET /api/billing/revenue/summary — aggregate revenue data
router.get('/revenue/summary', async (req, res, next) => {
    try {
        const [totals] = await pool.query(`
      SELECT
        COALESCE(SUM(total_amount), 0) AS total_revenue,
        COALESCE(SUM(CASE WHEN payment_status = 'pending' THEN total_amount ELSE 0 END), 0) AS pending_amount,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) AS paid_amount,
        COUNT(*) AS total_bills,
        SUM(payment_status = 'paid') AS paid_bills,
        SUM(payment_status = 'pending') AS pending_bills
      FROM billing
    `);

        const [monthly] = await pool.query(`
      SELECT
        DATE_FORMAT(paid_at, '%Y-%m') AS month,
        SUM(total_amount) AS revenue,
        COUNT(*) AS bills_paid
      FROM billing
      WHERE payment_status = 'paid' AND paid_at IS NOT NULL
      GROUP BY DATE_FORMAT(paid_at, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);

        res.json({ ...totals[0], monthly });
    } catch (err) {
        next(err);
    }
});

// GET /api/billing — list all bills with booking + guest info
router.get('/', async (req, res, next) => {
    try {
        const [rows] = await pool.query(`
      SELECT bl.*,
             b.check_in, b.check_out, b.status AS booking_status,
             CONCAT(g.first_name, ' ', g.last_name) AS guest_name, g.email,
             r.room_number, r.type AS room_type,
             DATEDIFF(b.check_out, b.check_in) AS nights
      FROM billing bl
      JOIN bookings b ON bl.booking_id = b.booking_id
      JOIN guests g ON b.guest_id = g.guest_id
      JOIN rooms r ON b.room_id = r.room_id
      ORDER BY bl.bill_id DESC
    `);
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

// GET /api/billing/:booking_id — bill for a specific booking
router.get('/:booking_id', async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            `SELECT bl.*,
              b.check_in, b.check_out, b.status AS booking_status,
              CONCAT(g.first_name, ' ', g.last_name) AS guest_name, g.email, g.phone,
              r.room_number, r.type AS room_type, r.price_per_night,
              DATEDIFF(b.check_out, b.check_in) AS nights
       FROM billing bl
       JOIN bookings b ON bl.booking_id = b.booking_id
       JOIN guests g ON b.guest_id = g.guest_id
       JOIN rooms r ON b.room_id = r.room_id
       WHERE bl.booking_id = ?`,
            [req.params.booking_id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Bill not found' });
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
});

// PUT /api/billing/:bill_id/pay — mark as paid
router.put('/:bill_id/pay', async (req, res, next) => {
    try {
        const { payment_method } = req.body;
        if (!payment_method) {
            return res.status(400).json({ error: 'payment_method is required' });
        }
        const [result] = await pool.query(
            `UPDATE billing SET payment_status = 'paid', payment_method = ?, paid_at = NOW()
       WHERE bill_id = ? AND payment_status = 'pending'`,
            [payment_method, req.params.bill_id]
        );
        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Bill not found or already paid' });
        }
        const [updated] = await pool.query('SELECT * FROM billing WHERE bill_id = ?', [req.params.bill_id]);
        res.json(updated[0]);
    } catch (err) {
        next(err);
    }
});

export default router;
