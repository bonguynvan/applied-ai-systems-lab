import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false, // Required for Neon
    },
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
