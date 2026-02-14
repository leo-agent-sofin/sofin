# Sofin Deployment Guide

## Vercel Deployment (Recommended for MVP)

### Option 1: Deploy with GitHub (Fastest)

1. **Create GitHub Repository**
```bash
git remote add origin https://github.com/yourusername/sofin
git push -u origin main
```

2. **Link to Vercel**
- Go to https://vercel.com/new
- Import the GitHub repository
- Select "Next.js" as the framework
- Configure environment variables (see below)
- Deploy!

3. **Set Environment Variables in Vercel**

Project: `sofin-frontend`
```
NEXT_PUBLIC_API_URL=https://sofin-api.vercel.app
NEXT_PUBLIC_APP_URL=https://sofin.vercel.app
```

Project: `sofin-backend` (API routes)
```
DATABASE_URL=postgresql://...  (use Vercel Postgres)
JWT_SECRET=your-secret-key-here-change-me
STRAVA_CLIENT_ID=your-strava-app-client-id
STRAVA_CLIENT_SECRET=your-strava-app-client-secret
STRAVA_REDIRECT_URI=https://sofin-backend.vercel.app/api/auth/strava/callback
FRONTEND_URL=https://sofin.vercel.app
NODE_ENV=production
```

### Option 2: Deploy with Docker (Alternative)

```bash
# Frontend
docker build -f frontend/Dockerfile -t sofin-frontend .
docker push your-registry/sofin-frontend

# Backend
docker build -f backend/Dockerfile -t sofin-backend .
docker push your-registry/sofin-backend
```

---

## Database Setup

### Vercel Postgres (Recommended)
1. In Vercel Dashboard: Storage → Create Database
2. Select PostgreSQL
3. Copy the connection string to DATABASE_URL
4. The database will be automatically initialized on first backend request

### Local PostgreSQL (Development)

```bash
# Using docker-compose
docker-compose up -d

# In another terminal, test connection:
psql -U sofin -d sofin -h localhost
```

Backend will auto-initialize tables on startup.

---

## Strava OAuth Setup

### Register Your App
1. Go to https://www.strava.com/settings/oauth
2. Create New Application
3. Set:
   - **Authorization Callback Domain:** `sofin-backend.vercel.app` (or your domain)
   - **Redirect URI:** `https://sofin-backend.vercel.app/api/auth/strava/callback`
4. Copy Client ID and Client Secret to environment variables

### Testing Without Strava (MVP)
For rapid MVP development, modify the Strava callback to mock data:

```typescript
// In src/index.ts, Strava callback handler:
// Instead of real exchange, return mock data
const mockData = {
  access_token: 'mock_token',
  refresh_token: 'mock_refresh',
  athlete: { id: 123456789 },
  all_ride_totals: { distance: 1250000 } // 1250 km
};
```

---

## Monitoring & Logs

### Vercel Logs
```bash
vercel logs [project-name]
vercel logs [project-name] --follow
```

### Database Queries
Connect via psql:
```bash
psql $DATABASE_URL

# List users
SELECT id, email, strava_id, strava_ytd_km FROM users;

# Check tokens
SELECT id, strava_access_token, strava_refresh_token FROM users WHERE strava_id IS NOT NULL;
```

---

## Health Check
```bash
curl https://sofin-backend.vercel.app/api/health
# Response: { "status": "ok" }
```

---

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- Check DATABASE_URL environment variable
- Ensure Vercel Postgres is provisioned
- Verify credentials are correct

### QR Code Not Generating
- Check for JavaScript errors in browser console
- Verify `qrcode` package is imported correctly
- Backend must return valid QR data URL

### Strava OAuth Failed
- Verify STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET
- Check redirect URI matches Strava app settings
- Ensure STRAVA_REDIRECT_URI matches configured URL

---

## Performance Optimization (Phase 2)

- [ ] Add CDN for QR code images
- [ ] Cache Strava stats with TTL
- [ ] Implement rate limiting
- [ ] Add analytics tracking
- [ ] Optimize database queries with indexes

---

_Last updated: 2026-02-15_
