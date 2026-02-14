# 🚀 Deploy Sofin NOW (5-Minute Process)

This is the fastest path to a working prototype on Vercel.

## Step 1: Create GitHub Repository (2 minutes)

```bash
# From sofin-app directory
git config user.email "your@email.com"
git config user.name "Your Name"

# Create repo on github.com and copy the URL
git remote add origin https://github.com/YOUR_USERNAME/sofin.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel (3 minutes)

### Deploy Frontend
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Paste: `https://github.com/YOUR_USERNAME/sofin.git`
4. Select "Next.js"
5. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://sofin-api.vercel.app
   NEXT_PUBLIC_APP_URL=https://sofin.vercel.app
   ```
6. Click "Deploy"
7. Wait ~1 minute
8. Note your deployment URL (e.g., `https://sofin-abc123.vercel.app`)

### Deploy Backend API
1. Go to https://vercel.com/new again
2. Import same repo
3. Select "Other" (not Next.js)
4. Set "Root Directory" to: `backend`
5. Set environment variables:
   ```
   DATABASE_URL=postgresql://user:pass@host/sofin
   JWT_SECRET=your-super-secret-key-change-me
   STRAVA_CLIENT_ID=12345  (get from strava.com/settings/oauth)
   STRAVA_CLIENT_SECRET=your-secret
   STRAVA_REDIRECT_URI=https://sofin-api-abc123.vercel.app/api/auth/strava/callback
   FRONTEND_URL=https://sofin-abc123.vercel.app
   NODE_ENV=production
   PORT=3001
   ```
6. Click "Deploy"

### Setup Vercel Postgres Database
1. In Vercel Dashboard, go to "Storage"
2. Click "Create Database" → "Postgres"
3. Select region
4. Copy the connection string
5. Paste into backend `DATABASE_URL` environment variable
6. Redeploy backend

## Step 3: Test It Works (No extra steps!)

- Frontend: https://sofin-abc123.vercel.app
- API Health: https://sofin-api-abc123.vercel.app/api/health

## Optional: Connect Strava

Skip this if you want to test without Strava (app will work with mock data).

1. Go to https://www.strava.com/settings/oauth
2. Create New App:
   - Name: Sofin
   - Category: Official Partner
   - Authorization Callback Domain: `sofin-api-abc123.vercel.app`
   - Callback Port: 443
3. Copy Client ID and Secret
4. Update backend environment variables
5. Redeploy

## ✅ You're Done!

- Sign up at your frontend URL
- (Optional) Connect Strava
- View QR code
- Share your stats!

## 🔄 If Something Breaks

### Check Logs
```bash
vercel logs [project-name]  # See errors
```

### Most Common Issues

**"Cannot find module qrcode"**
- Backend node_modules missing
- Redeploy with `vercel deploy --prod`

**"Database connection refused"**
- DATABASE_URL not set
- Postgres not provisioned
- Copy URL from Vercel Storage

**"Strava auth fails"**
- Skip Strava for MVP (app works without it)
- Or check callback URI matches settings

## 📝 That's It!

You now have a fully functional MVP running on Vercel.

Next steps (Phase 2):
- [ ] Invite beta users
- [ ] Collect feedback
- [ ] Add social links customization
- [ ] Setup analytics
- [ ] Scale to other sports

---

**Total time to production:** ~5 minutes  
**Cost:** Free tier covers MVP  
**Next MVP feature:** Social links UI

_Built in 12-hour sprint_
