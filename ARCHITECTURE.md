# Sofin Architecture

## 🏗️ System Overview

```
User Browser (Frontend)
     ↓ (HTTPS)
     ↓
[Next.js 14 App]
  - User auth UI
  - Dashboard
  - QR code display
  - Public stats page
     ↓ (REST API)
     ↓
[Express.js API]
  - User management
  - JWT authentication
  - Strava OAuth
  - QR generation
  - Stats endpoints
     ↓ (SQL)
     ↓
[PostgreSQL Database]
  - Users table
  - Auth tokens
  - Strava data
  - QR codes
     ↓ (OAuth)
     ↓
[Strava API]
  - Fetch cycling stats
  - Get athlete profile
  - Handle auth tokens
```

## 📁 Project Structure

```
sofin-app/
├── backend/                 # Express API
│   ├── src/
│   │   ├── index.ts        # Server + routes
│   │   ├── auth.ts         # JWT + bcrypt
│   │   ├── db.ts           # PostgreSQL queries
│   │   ├── strava.ts       # Strava API client
│   │   ├── qrcode.ts       # QR generation
│   │   └── types.ts        # TypeScript types
│   ├── dist/               # Compiled JS
│   ├── package.json        # Dependencies
│   └── tsconfig.json       # TypeScript config
│
├── frontend/               # Next.js app
│   ├── pages/
│   │   ├── index.tsx       # Home
│   │   ├── auth/
│   │   │   ├── signup.tsx
│   │   │   ├── login.tsx
│   │   │   └── strava-callback.tsx
│   │   ├── dashboard/
│   │   │   ├── index.tsx
│   │   │   └── qrcode.tsx
│   │   └── stats/
│   │       └── [userId].tsx
│   ├── lib/api.ts          # API client
│   ├── styles/
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml      # Local database
├── Dockerfile              # Container build
├── API.md                  # API documentation
├── DEPLOYMENT.md           # Deployment guide
├── QUICKSTART.md           # Quick start
└── ARCHITECTURE.md         # This file

```

## 🔄 User Flow

### 1. Signup / Login
```
User fills form → Frontend validates → 
API creates/verifies user → 
Returns JWT token → 
Stored in localStorage → 
Used for authenticated requests
```

### 2. Strava Connection
```
User clicks "Connect Strava" → 
Frontend requests auth URL from API → 
Redirects to Strava OAuth flow → 
User authorizes → 
Strava redirects back with code → 
API exchanges code for tokens → 
API fetches YTD cycling KM → 
API generates QR code → 
Stored in database
```

### 3. Share QR Code
```
User clicks "View QR Code" → 
Frontend fetches profile from API → 
API returns QR code (data URL) → 
Frontend displays + download/print options → 
User shares link `/stats/{userId}`
```

### 4. View Public Stats
```
Person scans QR or opens link → 
Public endpoint `/api/stats/{userId}` → 
No auth required → 
Returns name, cycling KM, social links → 
Displays on landing page
```

## 🔐 Security

### Authentication
- **Passwords:** Hashed with bcryptjs (10 salt rounds)
- **Sessions:** JWT tokens (7-day expiry)
- **Token Storage:** localStorage (susceptible to XSS, Phase 2: httpOnly cookies)
- **CORS:** Whitelisted frontend origin only

### Strava Integration
- **OAuth 2.0** - Standard flow, minimal scope (`activity:read_all`)
- **Token Storage:** Encrypted refresh tokens in database
- **Auto-refresh:** Tokens automatically refreshed when needed
- **Read-only:** Never posts or modifies athlete data

### Database
- **Connection:** SSL/TLS (Vercel Postgres default)
- **Environment:** Secrets stored in Vercel vault, not in code
- **Access:** Only backend can query, frontend uses API

## 📊 Database Schema

### Users Table
```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  password_hash VARCHAR,
  strava_id BIGINT UNIQUE,
  strava_access_token TEXT,
  strava_refresh_token TEXT,
  strava_ytd_km DECIMAL,
  qr_code_url TEXT,
  social_links JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**Indexes:**
- `idx_users_email` - Fast email lookups for login

## 🌐 API Design

### Base URL
- Dev: `http://localhost:3001`
- Prod: `https://sofin-api.vercel.app`

### Auth Endpoints
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Get JWT token
- `GET /api/auth/strava/url` - Get OAuth URL
- `POST /api/auth/strava/callback` - Process OAuth

### Protected Endpoints
- `GET /api/user/profile` - Current user (Bearer token required)
- `PUT /api/user/social-links` - Update links (Bearer token required)

### Public Endpoints
- `GET /api/stats/:userId` - Public stats (no auth)
- `GET /api/health` - Health check

## 🚀 Deployment Architecture

### Frontend Deployment
- **Provider:** Vercel
- **Build:** Next.js static + SSR
- **CDN:** Vercel's global CDN
- **Environment:** NEXT_PUBLIC_* variables
- **Redeploy:** On git push to main

### Backend Deployment
- **Provider:** Vercel (Serverless)
- **Runtime:** Node.js
- **Build:** TypeScript compilation
- **Database:** Vercel Postgres (managed)
- **Environment:** Secrets in Vercel vault

## 🔄 Data Flow

### Request Lifecycle
```
Frontend Request
  ↓
Axios interceptor adds Bearer token
  ↓
Express CORS middleware
  ↓
Route handler
  ↓
Auth middleware (if protected)
  ↓
Database query
  ↓
Response with data/error
  ↓
Frontend state update
  ↓
UI re-render
```

### Token Lifecycle
```
User signs up/logs in
  ↓
Backend generates JWT (7 days)
  ↓
Frontend stores in localStorage
  ↓
Added to Authorization header
  ↓
Backend verifies with JWT_SECRET
  ↓
Expires after 7 days
  ↓
User logs back in
```

## 📈 Scalability Considerations

### Current (MVP)
- Single database instance
- Basic JWT validation
- No rate limiting
- In-memory error handling

### Phase 2 Optimizations
- [ ] Redis cache for Strava stats
- [ ] Rate limiting per user
- [ ] Database connection pooling
- [ ] CDN for static assets
- [ ] Analytics data warehouse
- [ ] Admin dashboard

## 🧪 Testing Strategy

### Unit Tests (Phase 2)
- Auth utilities (password hashing, JWT)
- Database queries
- Strava API wrapper

### Integration Tests (Phase 2)
- Auth flow (signup → login)
- Strava OAuth callback
- QR code generation
- Stats endpoint

### E2E Tests (Phase 2)
- Full user journey (signup → share)
- Strava connection flow
- QR code scanning

## 🔗 Dependencies

### Backend
- **express** - HTTP server
- **pg** - PostgreSQL client
- **jsonwebtoken** - JWT handling
- **bcryptjs** - Password hashing
- **axios** - HTTP client (Strava API)
- **qrcode** - QR code generation
- **uuid** - UUID generation

### Frontend
- **react** - UI framework
- **next** - React framework + SSR
- **axios** - HTTP client
- **tailwindcss** - Styling

## 🐛 Error Handling

### Frontend
- Try/catch on API calls
- User-friendly error messages
- Fallback UI states
- Console logging for debugging

### Backend
- Express error middleware
- Graceful database failures
- Detailed error logging
- HTTP status codes

## 📝 Logging

### Frontend
- Browser console (dev tools)
- Error tracking (Phase 2)

### Backend
- Console.log to stdout
- Vercel function logs
- Error stack traces
- Request/response logging (Phase 2)

---

**Next Review:** Phase 2 architecture planning

_Built in 12-hour MVP sprint - Feb 2026_
