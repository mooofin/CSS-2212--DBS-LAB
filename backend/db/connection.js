import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connection config
const _host = process.env.DB_HOST || '127.0.0.1';
const _socketPath =
    process.env.DB_SOCKET ||
    (_host === 'localhost' ? '/run/mysqld/mysqld.sock' : undefined);

const pool = mysql.createPool({
    ...(_socketPath
        ? { socketPath: _socketPath }
        : { host: _host, port: Number(process.env.DB_PORT) || 3306 }),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hotel_mgmt',
    waitForConnections: true,
    connectionLimit: 10,
});

export default pool;
