import express from 'express';
import pool from '../db/connection.js';
import { HTTP_STATUS, USER_ROLES } from '../constants/index.js';

const router = express.Router();

// Customer Login
router.post('/login', async (req, res, next) => {
  const { identifier, password } = req.body;
  
  if (!identifier || !password) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
      error: 'Email/username and password are required' 
    });
  }

  try {
    const [rows] = await pool.query(
      'SELECT guest_id, first_name, last_name, email, username FROM guests WHERE (email = ? OR username = ?) AND password = ?',
      [identifier, identifier, password]
    );

    if (rows.length === 0) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
        error: 'Invalid credentials' 
      });
    }

    const customer = rows[0];
    res.json({
      guest_id: customer.guest_id,
      username: customer.username || customer.email,
      name: `${customer.first_name} ${customer.last_name}`,
      role: USER_ROLES.CUSTOMER
    });
  } catch (err) {
    next(err);
  }
});

// Get Personal Profile
router.get('/profile/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT guest_id, first_name, last_name, email, phone, address, id_type, id_number FROM guests WHERE guest_id = ?', 
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Guest not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    next(err);
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

// Guest Registration
router.post('/register', async (req, res, next) => {
  const { first_name, last_name, email, username, password, phone, address } = req.body;
  
  // Validation
  if (!first_name || !last_name || !email || !password) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
      error: 'First name, last name, email, and password are required' 
    });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
      error: 'Invalid email format' 
    });
  }

  // Password validation
  if (password.length < 6) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
      error: 'Password must be at least 6 characters' 
    });
  }

  try {
    // Check if email already exists
    const [existing] = await pool.query(
      'SELECT guest_id FROM guests WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(HTTP_STATUS.CONFLICT).json({ 
        error: 'Email already registered' 
      });
    }

    // Check if username already exists (if provided)
    if (username) {
      const [existingUsername] = await pool.query(
        'SELECT guest_id FROM guests WHERE username = ?',
        [username]
      );

      if (existingUsername.length > 0) {
        return res.status(HTTP_STATUS.CONFLICT).json({ 
          error: 'Username already taken' 
        });
      }
    }

    // Insert new guest
    const [result] = await pool.query(
      'INSERT INTO guests (first_name, last_name, email, username, password, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, email, username || null, password, phone || null, address || null]
    );

    const guest_id = result.insertId;

    // Return the new guest info (similar to login response)
    res.status(HTTP_STATUS.CREATED).json({
      guest_id,
      username: username || email,
      name: `${first_name} ${last_name}`,
      role: USER_ROLES.CUSTOMER,
      message: 'Registration successful'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
