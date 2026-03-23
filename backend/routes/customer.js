import express from 'express';
import pool from '../db/connection.js';

const router = express.Router();

// Customer Login
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body; // identifier can be email or username
  try {
    const [rows] = await pool.query(
      'SELECT guest_id, first_name, last_name, email, username FROM guests WHERE (email = ? OR username = ?) AND password = ?',
      [identifier, identifier, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const customer = rows[0];
    res.json({
      guest_id: customer.guest_id,
      username: customer.username || customer.email,
      name: `${customer.first_name} ${customer.last_name}`,
      role: 'customer'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Personal Profile
router.get('/profile/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM guests WHERE guest_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Guest not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Personal Bookings
router.get('/bookings/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM v_booking_details WHERE email = (SELECT email FROM guests WHERE guest_id = ?) ORDER BY check_in DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Profile
router.put('/profile/:id', async (req, res) => {
  const { first_name, last_name, phone, address, id_type, id_number } = req.body;
  try {
    await pool.query(
      'UPDATE guests SET first_name = ?, last_name = ?, phone = ?, address = ?, id_type = ?, id_number = ? WHERE guest_id = ?',
      [first_name, last_name, phone, address, id_type, id_number, req.params.id]
    );
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
