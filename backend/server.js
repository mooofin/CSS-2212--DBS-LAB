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
import authRouter from './routes/auth.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, '../frontend-astro/dist');

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
app.use('/api/auth', authRouter);

// Catch-all to serve the closest Astro page or the main index
app.get('*', (req, res) => {
    // Attempt to serve the specific route's index.html if it exists
    const routePath = req.path.endsWith('/') ? req.path : `${req.path}/`;
    const potentialFile = path.join(frontendPath, routePath, 'index.html');
    res.sendFile(potentialFile, (err) => {
        if (err) {
            res.sendFile(path.join(frontendPath, 'index.html'));
        }
    });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Grand Stay Production Server running on http://localhost:${PORT}`);
});

export default app;
