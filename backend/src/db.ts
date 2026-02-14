import { Pool } from 'pg';
import { User, SocialLink } from './types';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize database tables
export async function initDb() {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL not set - skipping database initialization');
    console.warn('   Set DATABASE_URL to enable database persistence');
    return;
  }

  try {
    const client = await pool.connect();
    try {
      // Users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255),
          strava_id BIGINT UNIQUE,
          strava_access_token TEXT,
          strava_refresh_token TEXT,
          strava_ytd_km DECIMAL(10, 2),
          qr_code_url TEXT,
          social_links JSONB DEFAULT '[]',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create index on email for faster lookups
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      `);

      console.log('✓ Database tables initialized');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('⚠️  Database initialization failed:', error);
    console.error('   This is OK for initial deployment - database will be created by Vercel Postgres');
  }
}

// User queries
export async function createUser(email: string, passwordHash?: string): Promise<User> {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash) VALUES ($1, $2)
     RETURNING id, email, password_hash, strava_id, strava_access_token, 
     strava_refresh_token, strava_ytd_km, qr_code_url, social_links, created_at, updated_at`,
    [email, passwordHash || null]
  );
  return result.rows[0];
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query(
    `SELECT id, email, password_hash, strava_id, strava_access_token,
     strava_refresh_token, strava_ytd_km, qr_code_url, social_links, created_at, updated_at
     FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await pool.query(
    `SELECT id, email, strava_id, strava_access_token,
     strava_refresh_token, strava_ytd_km, qr_code_url, social_links, created_at, updated_at
     FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function getUserByStravaId(stravaId: number): Promise<User | null> {
  const result = await pool.query(
    `SELECT id, email, strava_id, strava_access_token,
     strava_refresh_token, strava_ytd_km, qr_code_url, social_links, created_at, updated_at
     FROM users WHERE strava_id = $1`,
    [stravaId]
  );
  return result.rows[0] || null;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  const keys = Object.keys(updates).filter(k => k !== 'id' && updates[k as keyof User] !== undefined);
  const values = keys.map(k => updates[k as keyof User]);
  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');

  const result = await pool.query(
    `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${keys.length + 1}
     RETURNING id, email, strava_id, strava_access_token,
     strava_refresh_token, strava_ytd_km, qr_code_url, social_links, created_at, updated_at`,
    [...values, id]
  );
  return result.rows[0];
}

export { pool };
