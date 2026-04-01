import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import roomsRouter from './routes/rooms.js';
import guestsRouter from './routes/guests.js';
import bookingsRouter from './routes/bookings.js';
import billingRouter from './routes/billing.js';
import staffRouter from './routes/staff.js';
import customerRouter from './routes/customer.js';
import authRouter from './routes/auth.js';
import errorHandler from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
const frontendPath = path.join(__dirname, '../frontend/dist');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(frontendPath, { extensions: ['html'] }));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/rooms', roomsRouter);
app.use('/api/guests', guestsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/billing', billingRouter);
app.use('/api/staff', staffRouter);
app.use('/api/customer', customerRouter);
app.use('/api/auth', authRouter);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Catch-all to serve the React SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handler
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hotel Management Server running on http://0.0.0.0:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
