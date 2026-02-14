import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

import { initDb, createUser, getUserByEmail, getUserById, updateUser, getUserByStravaId } from './db';
import { hashPassword, comparePassword, generateToken, authMiddleware } from './auth';
import { getStravaAuthUrl, exchangeAuthCode, refreshAndGetYTDKm } from './strava';
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

    // Generate QR code pointing to landing page
    const qrData = `${FRONTEND_URL}/stats/${userId}`;
    const qrCodeUrl = await generateQRCode(qrData);

    // Update user with Strava info
    const updatedUser = await updateUser(userId, {
      strava_id: athleteId,
      strava_access_token: tokenData.access_token,
      strava_refresh_token: tokenData.refresh_token,
      strava_ytd_km: ytdKm,
      qr_code_url: qrCodeUrl,
    });

    res.json({
      success: true,
      user: updatedUser,
      qrCodeUrl,
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

// === PUBLIC ROUTES ===
// Get public stats (landing page data) - no auth required
app.get('/api/stats/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await getUserById(userId);

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
        await updateUser(userId, {
          strava_access_token: accessToken,
          strava_ytd_km: ytdKm,
        });
        user.strava_ytd_km = ytdKm;
      } catch (error) {
        console.error('Token refresh error:', error);
        // Continue with existing data if refresh fails
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

// Initialize database and start server
async function start() {
  try {
    await initDb();
    console.log('✓ Database initialized');
    
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ Strava OAuth URL: ${process.env.STRAVA_REDIRECT_URI}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
