# Sofin API Documentation

## Base URL
- Development: `http://localhost:3001`
- Production: `https://api.sofin.vercel.app` (placeholder)

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Auth Endpoints

### POST /api/auth/signup
Create a new user account with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure_password_123"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  },
  "token": "eyJhbGc..."
}
```

---

### POST /api/auth/login
Authenticate with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure_password_123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  },
  "token": "eyJhbGc..."
}
```

---

### GET /api/auth/strava/url
Get Strava OAuth authorization URL.

**Response (200):**
```json
{
  "authUrl": "https://www.strava.com/oauth/authorize?client_id=...",
  "state": "unique-state-token"
}
```

---

### POST /api/auth/strava/callback
Handle Strava OAuth callback after user grants permission.

**Request:**
```json
{
  "code": "auth_code_from_strava",
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "strava_id": 12345678,
    "strava_ytd_km": 1250.50,
    "qr_code_url": "data:image/png;base64,..."
  },
  "qrCodeUrl": "data:image/png;base64,..."
}
```

---

## 👤 User Endpoints

### GET /api/user/profile
Get current authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "strava_id": 12345678,
  "strava_ytd_km": 1250.50,
  "qr_code_url": "data:image/png;base64,...",
  "social_links": [
    {
      "platform": "instagram",
      "url": "https://instagram.com/username"
    }
  ]
}
```

---

### PUT /api/user/social-links
Update user's social media links.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "socialLinks": [
    { "platform": "instagram", "url": "https://instagram.com/username" },
    { "platform": "twitter", "url": "https://twitter.com/username" },
    { "platform": "facebook", "url": "https://facebook.com/username" }
  ]
}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "social_links": [...]
}
```

---

## 📊 Public Endpoints

### GET /api/stats/:userId
Get public stats for a user (no authentication required). Returns data shown on shared QR code landing page.

**Parameters:**
- `userId` - UUID of the user

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "strava_ytd_km": 1250.50,
  "social_links": [
    {
      "platform": "instagram",
      "url": "https://instagram.com/username"
    }
  ]
}
```

**Response (404):**
```json
{
  "error": "User not found"
}
```

---

### GET /api/health
Health check endpoint.

**Response (200):**
```json
{
  "status": "ok"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Email and password required"
}
```

### 401 Unauthorized
```json
{
  "error": "Missing or invalid authorization header"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 409 Conflict
```json
{
  "error": "Email already registered"
}
```

### 500 Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Strava Integration

### Token Refresh
- Tokens are automatically refreshed when needed
- Refresh happens on `/api/stats/:userId` calls
- New tokens are stored in the database

### Cycling Stats
- Scope: `activity:read_all`
- Data: YTD cycling kilometers (all_ride_totals.distance)
- Update: Automatic on token refresh

---

## Rate Limiting
Not yet implemented. Will be added in Phase 2.

---

## CORS
Frontend origin is whitelisted in CORS configuration:
```
Access-Control-Allow-Origin: http://localhost:3000 (dev)
Access-Control-Allow-Credentials: true
```

---

_Last updated: 2026-02-15_
