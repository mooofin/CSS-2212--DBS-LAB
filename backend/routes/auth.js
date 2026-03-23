import express from 'express';
import pool from '../db/connection.js';

const router = express.Router();

router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.execute(
      'SELECT user_id, username, role FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
