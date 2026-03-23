import { Router } from 'express';
import pool from '../db/connection.js';

const router = Router();

// GET /api/staff — list all, optional ?role=&is_active=&shift=
router.get('/', async (req, res, next) => {
    try {
        let sql = 'SELECT * FROM staff WHERE 1=1';
        const params = [];

        if (req.query.role) {
            sql += ' AND role = ?';
            params.push(req.query.role);
        }
        if (req.query.is_active !== undefined) {
            sql += ' AND is_active = ?';
            params.push(req.query.is_active === 'true' ? 1 : 0);
        }
        if (req.query.shift) {
            sql += ' AND shift = ?';
            params.push(req.query.shift);
        }

        sql += ' ORDER BY first_name ASC';
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

// GET /api/staff/:id — single staff member
router.get('/:id', async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM staff WHERE staff_id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Staff not found' });
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
});

// POST /api/staff — create staff member
router.post('/', async (req, res, next) => {
    try {
        const { first_name, last_name, role, email, phone, salary, shift, joining_date } = req.body;
        const [result] = await pool.query(
            `INSERT INTO staff (first_name, last_name, role, email, phone, salary, shift, joining_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [first_name, last_name, role, email, phone || null, salary || null, shift || null, joining_date]
        );
        const [newStaff] = await pool.query('SELECT * FROM staff WHERE staff_id = ?', [result.insertId]);
        res.status(201).json(newStaff[0]);
    } catch (err) {
        next(err);
    }
});

// PUT /api/staff/:id — update staff
router.put('/:id', async (req, res, next) => {
    try {
        const { first_name, last_name, role, email, phone, salary, shift, joining_date } = req.body;
        await pool.query(
            `UPDATE staff SET first_name = ?, last_name = ?, role = ?, email = ?, phone = ?,
       salary = ?, shift = ?, joining_date = ? WHERE staff_id = ?`,
            [first_name, last_name, role, email, phone, salary, shift, joining_date, req.params.id]
        );
        const [updated] = await pool.query('SELECT * FROM staff WHERE staff_id = ?', [req.params.id]);
        if (updated.length === 0) return res.status(404).json({ error: 'Staff not found' });
        res.json(updated[0]);
    } catch (err) {
        next(err);
    }
});

// PUT /api/staff/:id/deactivate — soft delete
router.put('/:id/deactivate', async (req, res, next) => {
    try {
        const [result] = await pool.query(
            'UPDATE staff SET is_active = FALSE WHERE staff_id = ?',
            [req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Staff not found' });
        res.json({ message: 'Staff member deactivated' });
    } catch (err) {
        next(err);
    }
});

export default router;
