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
          name VARCHAR(255),
          strava_id BIGINT UNIQUE,
          strava_access_token TEXT,
          strava_refresh_token TEXT,
          strava_ytd_km DECIMAL(10, 2),
          qr_code_url TEXT,
          primary_slug VARCHAR(255) UNIQUE,
          social_links JSONB DEFAULT '[]',
          synced_sources JSONB DEFAULT '{}',
          last_sync_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create index on email for faster lookups
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      `);

      // Activities table (stores Strava + Komoot activities)
      await client.query(`
        CREATE TABLE IF NOT EXISTS activities (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          source VARCHAR(50) NOT NULL,
          source_activity_id VARCHAR(255) NOT NULL,
          title VARCHAR(255),
          date DATE NOT NULL,
          distance_km DECIMAL(10, 2) NOT NULL,
          elevation_m INT,
          avg_speed_kmh DECIMAL(8, 2),
          duration_seconds INT,
          activity_type VARCHAR(50),
          raw_data JSONB,
          dedup_group_id UUID,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, source, source_activity_id)
        )
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_activities_user_date ON activities(user_id, date DESC);
      `);

      // Personal Records table
      await client.query(`
        CREATE TABLE IF NOT EXISTS personal_records (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          ytd_km DECIMAL(10, 2) DEFAULT 0,
          longest_ride_km DECIMAL(10, 2),
          longest_climb_m INT,
          avg_speed_kmh DECIMAL(8, 2),
          total_elevation_m INT DEFAULT 0,
          activity_count INT DEFAULT 0,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_records_user ON personal_records(user_id);
      `);

      // User Slugs table
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_slugs (
          slug VARCHAR(255) PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          is_primary BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_slugs_user ON user_slugs(user_id);
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

// Activity queries
export async function createActivity(data: {
  user_id: string;
  source: 'strava' | 'komoot';
  source_activity_id: string;
  title: string;
  date: string;
  distance_km: number;
  elevation_m: number;
  avg_speed_kmh: number;
  duration_seconds: number;
  activity_type: string;
  raw_data: any;
}): Promise<void> {
  await pool.query(`
    INSERT INTO activities (user_id, source, source_activity_id, title, date, 
      distance_km, elevation_m, avg_speed_kmh, duration_seconds, activity_type, raw_data)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (user_id, source, source_activity_id) DO UPDATE SET
      title = $4, date = $5, distance_km = $6, elevation_m = $7,
      avg_speed_kmh = $8, duration_seconds = $9, activity_type = $10,
      raw_data = $11, updated_at = CURRENT_TIMESTAMP
  `, [data.user_id, data.source, data.source_activity_id, data.title, 
      data.date, data.distance_km, data.elevation_m, data.avg_speed_kmh,
      data.duration_seconds, data.activity_type, JSON.stringify(data.raw_data)]);
}

export async function getActivities(userId: string, limit = 20, offset = 0): Promise<any[]> {
  const result = await pool.query(`
    SELECT 
      id, user_id, source, source_activity_id, title, date, 
      distance_km, elevation_m, avg_speed_kmh, duration_seconds, 
      activity_type, created_at
    FROM activities
    WHERE user_id = $1
    ORDER BY date DESC, created_at DESC
    LIMIT $2 OFFSET $3
  `, [userId, limit, offset]);
  return result.rows;
}

export async function deleteOldActivities(userId: string, source: string): Promise<void> {
  await pool.query(`
    DELETE FROM activities 
    WHERE user_id = $1 AND source = $2 AND date < NOW() - INTERVAL '1 year'
  `, [userId, source]);
}

// Personal Records queries
export async function upsertPersonalRecords(userId: string, records: {
  ytd_km: number;
  longest_ride_km: number;
  longest_climb_m: number;
  avg_speed_kmh: number;
  total_elevation_m: number;
  activity_count: number;
}): Promise<void> {
  await pool.query(`
    INSERT INTO personal_records (user_id, ytd_km, longest_ride_km, longest_climb_m, 
      avg_speed_kmh, total_elevation_m, activity_count, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id) DO UPDATE SET
      ytd_km = $2, longest_ride_km = $3, longest_climb_m = $4, avg_speed_kmh = $5,
      total_elevation_m = $6, activity_count = $7, updated_at = CURRENT_TIMESTAMP
  `, [userId, records.ytd_km, records.longest_ride_km, records.longest_climb_m,
      records.avg_speed_kmh, records.total_elevation_m, records.activity_count]);
}

export async function getPersonalRecords(userId: string): Promise<any> {
  const result = await pool.query(
    `SELECT ytd_km, longest_ride_km, longest_climb_m, avg_speed_kmh, total_elevation_m, activity_count, updated_at
     FROM personal_records WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0] || null;
}

// Slug queries
export async function createSlug(userId: string, slug: string, isPrimary = true): Promise<void> {
  await pool.query(`
    INSERT INTO user_slugs (user_id, slug, is_primary)
    VALUES ($1, $2, $3)
    ON CONFLICT (slug) DO NOTHING
  `, [userId, slug, isPrimary]);
}

export async function getSlug(slug: string): Promise<any> {
  const result = await pool.query(
    `SELECT slug, user_id, is_primary FROM user_slugs WHERE slug = $1`,
    [slug]
  );
  return result.rows[0] || null;
}

export async function getPrimarySlug(userId: string): Promise<string | null> {
  const result = await pool.query(
    `SELECT slug FROM user_slugs WHERE user_id = $1 AND is_primary = true LIMIT 1`,
    [userId]
  );
  return result.rows[0]?.slug || null;
}

export async function updatePrimarySlug(userId: string, newSlug: string): Promise<void> {
  await pool.query(
    `UPDATE user_slugs SET is_primary = false WHERE user_id = $1 AND is_primary = true`,
    [userId]
  );
  await createSlug(userId, newSlug, true);
}

export { pool };
