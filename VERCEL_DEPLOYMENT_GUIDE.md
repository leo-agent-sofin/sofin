# 🚀 Vercel Deployment Guide for Sofin

**Status:** GitHub code pushed ✅  
**GitHub Repo:** https://github.com/leo-agent-sofin/sofin  
**Target:** Deploy both frontend and backend, get URLs for Testing agent

---

## Step 1: Deploy Frontend

1. Go to **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. Paste: `https://github.com/leo-agent-sofin/sofin`
4. Click **"Continue"**
5. Select **"Next.js"** as the framework
6. Configure environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://sofin-api.vercel.app
   NEXT_PUBLIC_APP_URL=https://sofin.vercel.app
   ```
   _(Note: Update `sofin-api.vercel.app` after backend deployment)_
7. Click **"Deploy"**
8. ⏳ Wait ~2 minutes for build to complete
9. ✅ Get frontend URL (e.g., `https://sofin-abc123.vercel.app`)
10. Copy this URL for later

---

## Step 2: Deploy Backend

1. Go to **https://vercel.com/new** again
2. Click **"Import Git Repository"**
3. Paste same repo: `https://github.com/leo-agent-sofin/sofin`
4. Click **"Continue"**
5. **IMPORTANT:** Click "Edit" next to project name, then:
   - Root Directory: `backend`
   - Click **"Continue"**
6. For Framework, select **"Other"** (not Next.js)
7. Configure environment variables:
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=sofin-super-secret-key-change-me-in-production
   STRAVA_CLIENT_ID=12345
   STRAVA_CLIENT_SECRET=your-client-secret
   STRAVA_REDIRECT_URI=https://sofin-api-abc123.vercel.app/api/auth/strava/callback
   FRONTEND_URL=https://sofin-abc123.vercel.app
   DATABASE_URL=postgresql://...  (set after Postgres provisioning)
   ```
8. Click **"Deploy"**
9. ⏳ Wait ~2 minutes
10. ✅ Get backend URL (e.g., `https://sofin-api-abc123.vercel.app`)

---

## Step 3: Setup Vercel Postgres (Optional but Recommended)

1. Go to **https://vercel.com/dashboard**
2. Click **"Storage"**
3. Click **"Create Database"** → **"Postgres"**
4. Select region (default is fine)
5. Click **"Create"**
6. Copy the connection string (starts with `postgresql://`)
7. Go to backend deployment settings
8. Add environment variable:
   ```
   DATABASE_URL=<paste connection string>
   ```
9. Redeploy backend

---

## Step 4: Update Frontend API URL (After Backend Live)

1. Go to frontend deployment settings (Vercel dashboard)
2. Update environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://sofin-api-abc123.vercel.app
   ```
3. Redeploy frontend

---

## Step 5: Test

- **Frontend:** https://sofin-abc123.vercel.app
- **API Health:** https://sofin-api-abc123.vercel.app/api/health
- Should return: `{"status":"ok"}`

---

## Environment Variables Reference

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://sofin-api.vercel.app
NEXT_PUBLIC_APP_URL=https://sofin.vercel.app
```

### Backend (.env)
```
NODE_ENV=production
PORT=3001
JWT_SECRET=sofin-super-secret-key-change-me
DATABASE_URL=postgresql://user:pass@host/sofin
STRAVA_CLIENT_ID=12345
STRAVA_CLIENT_SECRET=your-secret
STRAVA_REDIRECT_URI=https://sofin-api-abc123.vercel.app/api/auth/strava/callback
FRONTEND_URL=https://sofin-abc123.vercel.app
```

---

## Optional: Connect Strava (Phase 2, Skip for MVP)

If you want real Strava integration:

1. Go to https://www.strava.com/settings/oauth
2. Click **"Create New App"**
3. Fill in:
   - Name: `Sofin`
   - Category: `Official Partner`
   - Authorization Callback Domain: `sofin-api-abc123.vercel.app`
   - Callback Port: `443`
4. Copy Client ID and Secret
5. Update backend environment variables:
   ```
   STRAVA_CLIENT_ID=<your-id>
   STRAVA_CLIENT_SECRET=<your-secret>
   ```
6. Redeploy backend

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails on frontend | Check Next.js build output in Vercel logs |
| Build fails on backend | Ensure `backend/` root directory is set correctly |
| API not responding | Check DATABASE_URL is set and Postgres is provisioned |
| "Module not found" errors | Reinstall dependencies with `npm ci` in Vercel settings |

---

## Success Criteria

- ✅ Frontend loads at https://sofin-abc123.vercel.app
- ✅ Backend responds at https://sofin-api-abc123.vercel.app/api/health
- ✅ Can sign up at frontend
- ✅ QR code page loads
- ✅ Public stats page accessible

---

**Estimated time to live:** 10-15 minutes from clicking deploy  
**Cost:** Free tier covers MVP  
**Next steps:** Hand off to Testing agent with live URLs
