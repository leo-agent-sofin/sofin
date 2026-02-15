import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

import { 
  initDb, createUser, getUserByEmail, getUserById, updateUser, getUserByStravaId,
  createActivity, getActivities, getPersonalRecords, upsertPersonalRecords,
  createSlug, getSlug, getPrimarySlug, updatePrimarySlug
} from './db';
import { hashPassword, comparePassword, generateToken, authMiddleware } from './auth';
import { getStravaAuthUrl, exchangeAuthCode, refreshAndGetYTDKm, getAthleteProfile } from './strava';
import { generateQRCode } from './qrcode';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(express.json());
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

// === AUTH ROUTES ===
// 1. Email signup
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser(email, passwordHash);
    const token = generateToken(user.id);

    res.status(201).json({
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// 2. Email login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await getUserByEmail(email);
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id);
    res.json({
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// 3. Strava OAuth - get auth URL
app.get('/api/auth/strava/url', (req: Request, res: Response) => {
  try {
    const state = uuidv4();
    const authUrl = getStravaAuthUrl(state);
    res.json({ authUrl, state });
  } catch (error) {
    console.error('Strava auth URL error:', error);
    res.status(500).json({ error: 'Failed to generate Strava auth URL' });
  }
});

// 4. Strava OAuth - callback
app.post('/api/auth/strava/callback', async (req: Request, res: Response) => {
  try {
    const { code, userId } = req.body;

    if (!code || !userId) {
      return res.status(400).json({ error: 'Code and userId required' });
    }

    // Exchange code for token
    const tokenData = await exchangeAuthCode(code);
    const athleteId = tokenData.athlete.id;

    // Check if Strava account already connected to another user
    const existingUser = await getUserByStravaId(athleteId);
    if (existingUser && existingUser.id !== userId) {
      return res.status(409).json({ error: 'This Strava account is already connected to another user' });
    }

    // Get YTD cycling KM
    const ytdKm = await (async () => {
      try {
        const { getAthleteStats } = await import('./strava');
        const stats = await getAthleteStats(tokenData.access_token, athleteId as number);
        return Math.round((stats.all_ride_totals.distance / 1000) * 100) / 100;
      } catch {
        return 0;
      }
    })();

    // Fetch athlete profile for name
    const athleteProfile = await getAthleteProfile(tokenData.access_token);
    const name = `${athleteProfile.firstname} ${athleteProfile.lastname}`;

    // Generate slug from name
    const { generateSlug } = await import('./slugs');
    const slug = await generateSlug(name);
    await createSlug(userId, slug, true);

    // Generate QR code pointing to landing page with slug
    const qrData = `${FRONTEND_URL}/${slug}`;
    const qrCodeUrl = await generateQRCode(qrData);

    // Update user with Strava info, name, and slug
    const updatedUser = await updateUser(userId, {
      name: name,
      strava_id: athleteId,
      strava_access_token: tokenData.access_token,
      strava_refresh_token: tokenData.refresh_token,
      strava_ytd_km: ytdKm,
      qr_code_url: qrCodeUrl,
      primary_slug: slug,
      synced_sources: { strava: true },
      last_sync_at: new Date(),
    } as any);

    res.json({
      success: true,
      user: updatedUser,
      qrCodeUrl,
      slug,
    });
  } catch (error) {
    console.error('Strava callback error:', error);
    res.status(500).json({ error: 'Failed to process Strava authentication' });
  }
});

// === USER ROUTES ===
// Get current user profile
app.get('/api/user/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await getUserById(req.userId!);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      strava_id: user.strava_id,
      strava_ytd_km: user.strava_ytd_km,
      qr_code_url: user.qr_code_url,
      social_links: user.social_links || [],
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user social links
app.put('/api/user/social-links', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { socialLinks } = req.body;

    if (!Array.isArray(socialLinks)) {
      return res.status(400).json({ error: 'socialLinks must be an array' });
    }

    const updatedUser = await updateUser(req.userId!, {
      social_links: socialLinks,
    });

    res.json({
      id: updatedUser.id,
      social_links: updatedUser.social_links || [],
    });
  } catch (error) {
    console.error('Update social links error:', error);
    res.status(500).json({ error: 'Failed to update social links' });
  }
});

// === ACTIVITY ENDPOINTS ===
// Get user's activities (deduplicated)
app.get('/api/user/activities', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { limit = '20', offset = '0' } = req.query;
    const activities = await getActivities(req.userId!, parseInt(limit as string), parseInt(offset as string));
    
    res.json({
      activities,
      total: activities.length,
    });
  } catch (error) {
    console.error('Activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Sync Strava activities (triggers background job)
app.post('/api/sync/strava', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await getUserById(req.userId!);
    if (!user?.strava_access_token) {
      return res.status(400).json({ error: 'Strava not connected' });
    }

    // Run sync
    const { syncStravaActivities, fetchPersonalRecordsFromActivities } = 
      await import('./strava-sync');

    const activityCount = await syncStravaActivities(
      user.strava_access_token,
      user.strava_id as number,
      req.userId!
    );

    // Recalculate personal records
    const activities = await getActivities(req.userId!, 1000);
    const records = await fetchPersonalRecordsFromActivities(req.userId!, activities);
    await upsertPersonalRecords(req.userId!, records);

    // Update last sync time
    await updateUser(req.userId!, {
      last_sync_at: new Date(),
    } as any);

    res.json({
      status: 'completed',
      activities_synced: activityCount,
      personal_records: records,
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
});

// === PERSONAL RECORDS ENDPOINTS ===

// Get user's personal records
app.get('/api/user/records', authMiddleware, async (req: Request, res: Response) => {
  try {
    const records = await getPersonalRecords(req.userId!);
    
    res.json(records || {
      ytd_km: 0,
      longest_ride_km: 0,
      longest_climb_m: 0,
      avg_speed_kmh: 0,
      total_elevation_m: 0,
      activity_count: 0,
    });
  } catch (error) {
    console.error('Records error:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

// === SLUG ENDPOINTS ===

// Check slug availability
app.get('/api/slug/check', async (req: Request, res: Response) => {
  try {
    const { slug } = req.query as { slug: string };
    
    if (!slug) {
      return res.status(400).json({ error: 'Slug required' });
    }

    const { validateSlugFormat, checkSlugAvailability } = await import('./slugs');
    
    const isValid = await validateSlugFormat(slug);
    if (!isValid) {
      return res.json({ 
        available: false, 
        reason: 'Invalid format (only lowercase letters, numbers, hyphens, 3-50 chars)' 
      });
    }

    const available = await checkSlugAvailability(slug);
    res.json({ available });
  } catch (error) {
    console.error('Slug check error:', error);
    res.status(500).json({ error: 'Failed to check slug' });
  }
});

// Update user's primary slug
app.put('/api/user/slug', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { slug } = req.body;

    if (!slug) {
      return res.status(400).json({ error: 'Slug required' });
    }

    const { validateSlugFormat, checkSlugAvailability } = await import('./slugs');
    
    const isValid = await validateSlugFormat(slug);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid slug format' });
    }

    const available = await checkSlugAvailability(slug);
    if (!available) {
      return res.status(409).json({ error: 'Slug already taken' });
    }

    await updatePrimarySlug(req.userId!, slug);

    const updatedUser = await updateUser(req.userId!, {
      primary_slug: slug,
    } as any);

    res.json({
      slug,
      user: { id: updatedUser.id, email: updatedUser.email },
    });
  } catch (error) {
    console.error('Update slug error:', error);
    res.status(500).json({ error: 'Failed to update slug' });
  }
});

// === PUBLIC ROUTES ===

// Get public stats by slug (NEW - replaces userId endpoint)
app.get('/api/stats/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    // Try as slug first
    const slugRow = await getSlug(slug);
    if (slugRow) {
      const user = await getUserById(slugRow.user_id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Refresh Strava token if needed
      if (user.strava_refresh_token && user.strava_id) {
        try {
          const { accessToken, ytdKm } = await refreshAndGetYTDKm(
            user.strava_refresh_token,
            user.strava_id
          );
          await updateUser(user.id, {
            strava_access_token: accessToken,
            strava_ytd_km: ytdKm,
          });
          user.strava_ytd_km = ytdKm;
        } catch (error) {
          console.error('Token refresh error:', error);
        }
      }

      const records = await getPersonalRecords(user.id);
      return res.json({
        id: user.id,
        name: user.name || user.email,
        slug: slug,
        strava_ytd_km: user.strava_ytd_km || 0,
        personal_records: records,
        social_links: user.social_links || [],
      });
    }

    // Fallback: try as userId
    const user = await getUserById(slug);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Refresh Strava token if needed
    if (user.strava_refresh_token && user.strava_id) {
      try {
        const { accessToken, ytdKm } = await refreshAndGetYTDKm(
          user.strava_refresh_token,
          user.strava_id
        );
        await updateUser(slug, {
          strava_access_token: accessToken,
          strava_ytd_km: ytdKm,
        });
        user.strava_ytd_km = ytdKm;
      } catch (error) {
        console.error('Token refresh error:', error);
      }
    }

    res.json({
      id: user.id,
      strava_ytd_km: user.strava_ytd_km || 0,
      social_links: user.social_links || [],
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Error handling for uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Initialize database and start server
async function start() {
  try {
    console.log('🚀 Starting Sofin server...');
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    await initDb();
    
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(`✓ Strava OAuth redirect: ${process.env.STRAVA_REDIRECT_URI}`);
      console.log('');
      console.log('🎯 API Endpoints:');
      console.log('   POST   /api/auth/signup');
      console.log('   POST   /api/auth/login');
      console.log('   GET    /api/auth/strava/url');
      console.log('   POST   /api/auth/strava/callback');
      console.log('   GET    /api/user/profile (protected)');
      console.log('   PUT    /api/user/social-links (protected)');
      console.log('   GET    /api/stats/:userId (public)');
      console.log('   GET    /api/health');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
