# Sofin - QR Code Sports Stats MVP

Share your cycling stats via QR code. Athletes create an account, connect their Strava profile, and get a unique QR code to share their YTD kilometers and social media profiles.

## 📋 Tech Stack

- **Backend:** Node.js + Express + TypeScript
- **Frontend:** Next.js 14 + React + TypeScript + Tailwind CSS
- **Database:** PostgreSQL (Vercel Postgres)
- **Hosting:** Vercel

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm/yarn
- PostgreSQL database (or Vercel Postgres)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database URL, Strava credentials, etc.
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000

## 📚 API Routes

### Authentication
- `POST /api/auth/signup` - Create account with email/password
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/strava/url` - Get Strava OAuth authorization URL
- `POST /api/auth/strava/callback` - Handle Strava OAuth callback

### User
- `GET /api/user/profile` - Get current user profile (protected)
- `PUT /api/user/social-links` - Update social media links (protected)

### Public
- `GET /api/stats/:userId` - Get public stats for a user (no auth)

## 🔄 Strava Integration

1. Register app at https://www.strava.com/settings/oauth
2. Get Client ID and Client Secret
3. Set STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET in .env
4. Users can connect their Strava account via OAuth

## 📱 User Flow

1. **Signup** → Email-based account creation
2. **Dashboard** → Connect Strava account (OAuth)
3. **QR Code** → Generate & download personal QR code
4. **Share** → Share QR code link
5. **Public Landing Page** → Scan QR → View stats + social links

## 🛠️ Development

### Monorepo Structure
```
sofin-app/
├── backend/          # Express API
├── frontend/         # Next.js app
└── vercel.json       # Vercel deployment config
```

### Build for Production
```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build && npm start
```

## 📦 Deployment to Vercel

1. Push to GitHub
2. Link repo in Vercel
3. Set environment variables:
   - DATABASE_URL
   - JWT_SECRET
   - STRAVA_CLIENT_ID
   - STRAVA_CLIENT_SECRET
   - FRONTEND_URL
4. Deploy

## ⚠️ Known Limitations (MVP)

- Cycling stats only (Strava read-only)
- Email/password auth only (no social login yet)
- Social links picker UI in progress
- No analytics/admin dashboard
- Free tier only (pricing phase 2)

## 📝 Environment Variables

Backend (.env):
```
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
STRAVA_CLIENT_ID=your-strava-client-id
STRAVA_CLIENT_SECRET=your-strava-client-secret
STRAVA_REDIRECT_URI=http://localhost:3001/api/auth/strava/callback
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Frontend (.env.local):
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔐 Security Notes

- Passwords hashed with bcryptjs
- JWT tokens for session management
- CORS enabled for frontend origin
- Strava tokens stored securely in DB
- Read-only Strava scope

---

**Built in 12-hour MVP sprint** - Feb 2026
