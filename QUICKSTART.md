# Sofin Quick Start Guide

Get Sofin running in 5 minutes.

## 🚀 Local Development (Minimal Setup)

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/sofin.git
cd sofin

# Install backend
cd backend && npm install && cd ..

# Install frontend
cd frontend && npm install && cd ..
```

### 2. Start Without Database (Test UI)
```bash
# Terminal 1: Frontend
cd frontend
npm run dev
# Runs on http://localhost:3000
```

The frontend will work without the backend - you can test the UI flow.

### 3. Start With Local Database (Full Test)
```bash
# Prerequisites: Docker installed

# Terminal 1: Database
docker-compose up

# Terminal 2: Backend
cd backend
cp .env.example .env
# Edit .env and set:
# DATABASE_URL=postgresql://sofin:sofin_dev_password@localhost:5432/sofin
npm run dev
# Runs on http://localhost:3001

# Terminal 3: Frontend
cd frontend
cp .env.local.example .env.local
npm run dev
# Runs on http://localhost:3000
```

## 🌍 Deploy to Vercel (5 minutes)

### 1. Push to GitHub
```bash
git init (if not already done)
git remote add origin https://github.com/yourusername/sofin
git push -u origin main
```

### 2. Create Vercel Projects
- Go to https://vercel.com/new
- Import the GitHub repository
- Add environment variables (see below)
- Click Deploy

### 3. Environment Variables

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=https://sofin-api.vercel.app
NEXT_PUBLIC_APP_URL=https://sofin.vercel.app
```

**Backend (.env):**
```
DATABASE_URL=postgresql://...  (from Vercel Postgres)
JWT_SECRET=your-super-secret-key-change-this
STRAVA_CLIENT_ID=your-strava-id
STRAVA_CLIENT_SECRET=your-strava-secret
STRAVA_REDIRECT_URI=https://sofin-api.vercel.app/api/auth/strava/callback
FRONTEND_URL=https://sofin.vercel.app
NODE_ENV=production
PORT=3001
```

### 4. Setup Vercel Postgres
- In Vercel Dashboard: Storage → Create Database
- Copy DATABASE_URL to backend environment variables
- Done! Tables auto-create on first request

### 5. Strava Setup (Optional for MVP)
- Go to https://www.strava.com/settings/oauth
- Register new application
- Set Callback Domain: `sofin-api.vercel.app`
- Copy Client ID and Secret to environment variables

Or skip Strava and the app will work with mock data.

## 🧪 Testing the App

### Signup & Login
1. Go to http://localhost:3000 (or deployed URL)
2. Click "Sign Up"
3. Enter email and password
4. Login with those credentials

### Connect Strava (Optional)
1. From Dashboard, click "Connect Strava"
2. Authorize in Strava popup
3. Redirects back to dashboard with QR code

### View QR Code
1. From Dashboard, click "View QR Code"
2. Download or print
3. Share the public link: `/stats/{userId}`

## 📱 Share Your Stats
1. Get your user ID from dashboard
2. Share link: `https://sofin.vercel.app/stats/{userId}`
3. Others can scan QR or visit link
4. They see your cycling stats + social media links

## 📚 Documentation

- **README.md** - Overview and tech stack
- **API.md** - Full API endpoint documentation
- **DEPLOYMENT.md** - Detailed deployment guide
- **QUICKSTART.md** - This file!

## 🆘 Troubleshooting

**"Cannot connect to database"**
- Check DATABASE_URL is set and valid
- Ensure Vercel Postgres is provisioned
- Restart deployment

**"QR code not showing"**
- Check browser console for errors
- Ensure Strava is connected (optional - can skip)
- Try refreshing page

**"Login fails"**
- Check email and password are correct
- Ensure backend is running
- Check NEXT_PUBLIC_API_URL points to correct backend

## 🚀 What's Next (Phase 2)

- [ ] Social media links customization
- [ ] Analytics dashboard
- [ ] Multi-sport support
- [ ] QR code printing/delivery
- [ ] Mobile app
- [ ] Premium tiers

---

Ready to deploy? See DEPLOYMENT.md for detailed instructions.

Need help? Check API.md for endpoint details.

_Built in 12-hour MVP sprint - Feb 2026_
