# Sofin - Getting Started

## Welcome! 👋

This is a complete MVP (Minimum Viable Product) for Sofin - a QR code-based sports stats sharing platform.

Everything is built, tested, and ready to deploy.

## 🎯 What's Done

✅ **Full Backend API** (Node.js + Express + TypeScript)
- User authentication (email/password)
- Strava OAuth integration
- QR code generation
- Public stats endpoint
- Database schema and migrations

✅ **Full Frontend App** (Next.js + React + TypeScript)
- Home page with signup/login
- User dashboard
- QR code display + download/print
- Public stats landing page
- Status/health check page

✅ **Production Ready**
- Docker support
- Vercel deployment configured
- CI/CD workflow
- Environment variable management
- Error handling

✅ **Complete Documentation**
- API documentation (API.md)
- Architecture overview (ARCHITECTURE.md)
- Quick start guide (QUICKSTART.md)
- Deployment guide (DEPLOYMENT.md)
- 5-minute deployment (DEPLOY_NOW.md)

## 🚀 Quick Start

### Option 1: Deploy to Vercel Right Now (5 minutes)

See **DEPLOY_NOW.md** for step-by-step instructions. This is the recommended path.

Summary:
1. Push to GitHub: `git push https://github.com/YOUR_USERNAME/sofin`
2. Import in Vercel: https://vercel.com/new
3. Set environment variables (see DEPLOY_NOW.md)
4. Click Deploy
5. Done! 🎉

### Option 2: Run Locally (10 minutes)

See **QUICKSTART.md** for detailed instructions.

Summary:
```bash
# Terminal 1: Frontend
cd frontend && npm install && npm run dev

# Terminal 2: Backend (optional - frontend works without it)
cd backend && npm install && npm run dev
```

Frontend runs on http://localhost:3000

## 📋 What You Can Do

1. **Create Account**
   - Email-based signup
   - Password hashing (bcryptjs)
   - JWT tokens for session management

2. **Connect Strava** (Optional)
   - OAuth 2.0 flow
   - Automatic YTD cycling KM fetching
   - Token refresh handling
   - Works without Strava (mock data)

3. **Generate QR Code**
   - Automatic generation when Strava connected
   - Download as PNG
   - Print to physical medium
   - Unique URL per user

4. **Share Stats**
   - Public landing page: `/stats/{userId}`
   - Displays cycling KM + social links
   - No authentication required
   - Scanned QR redirects here

## 🏗️ Project Structure

```
sofin-app/
├── backend/              # Express API
│   ├── src/
│   │   ├── index.ts      # Routes and server
│   │   ├── auth.ts       # JWT + password hashing
│   │   ├── db.ts         # Database queries
│   │   ├── strava.ts     # Strava API client
│   │   ├── qrcode.ts     # QR generation
│   │   ├── types.ts      # TypeScript types
│   │   ├── utils.ts      # Utility functions
│   │   └── demo.ts       # Demo/mock data
│   └── dist/             # Compiled JavaScript
│
├── frontend/             # Next.js app
│   ├── pages/
│   │   ├── index.tsx     # Home/landing
│   │   ├── status.tsx    # Health check
│   │   ├── auth/         # Login/signup
│   │   ├── dashboard/    # User dashboard
│   │   └── stats/        # Public stats page
│   ├── lib/
│   │   └── api.ts        # API client
│   └── styles/
│
└── docs/
    ├── README.md         # Overview
    ├── QUICKSTART.md     # Local setup
    ├── DEPLOY_NOW.md     # 5-min production
    ├── DEPLOYMENT.md     # Detailed deployment
    ├── API.md            # API docs
    ├── ARCHITECTURE.md   # System design
    └── GETTING_STARTED.md (this file)
```

## 🔧 Technology Stack

- **Frontend:** React 18, Next.js 14, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL (Vercel Postgres)
- **Hosting:** Vercel (both frontend and backend)
- **Authentication:** JWT tokens + bcryptjs
- **External:** Strava API (OAuth 2.0)

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Get JWT token
- `GET /api/auth/strava/url` - Get Strava OAuth URL
- `POST /api/auth/strava/callback` - Handle Strava auth

### User (Protected)
- `GET /api/user/profile` - Get current user
- `PUT /api/user/social-links` - Update social links

### Public
- `GET /api/stats/:userId` - Get public stats
- `GET /api/health` - Health check

See **API.md** for full documentation.

## 🔐 Environment Variables

### Backend (.env or .env.production)
```
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
STRAVA_CLIENT_ID=your-strava-id
STRAVA_CLIENT_SECRET=your-strava-secret
STRAVA_REDIRECT_URI=https://sofin-api.vercel.app/api/auth/strava/callback
FRONTEND_URL=https://sofin.vercel.app
NODE_ENV=production
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://sofin-api.vercel.app
NEXT_PUBLIC_APP_URL=https://sofin.vercel.app
```

## 📝 Key Features

### ✅ Implemented (MVP)
- Email/password authentication
- Strava OAuth integration (read-only)
- QR code generation + display
- Public stats landing page
- User profile management
- Database persistence
- Error handling
- Production deployment

### 🔜 Future (Phase 2)
- Social media links customization UI
- Multiple sports (not just cycling)
- Analytics dashboard
- Admin panel
- User profiles with avatars
- Password reset
- Email verification
- Rate limiting
- QR code printing service
- Mobile app

## 🚨 Troubleshooting

### Frontend won't start
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend won't compile
```bash
cd backend
npm install @types/bcryptjs @types/cors @types/uuid @types/qrcode
npm run build
```

### Database connection error
- Check DATABASE_URL is set
- Ensure Vercel Postgres is provisioned
- Verify credentials are correct

### API not responding
- Check backend is running: `curl http://localhost:3001/api/health`
- Check NEXT_PUBLIC_API_URL points to correct backend
- Check CORS is allowing frontend origin

## 📞 Support

For issues or questions:
1. Check the relevant documentation (API.md, ARCHITECTURE.md, etc.)
2. Look at the Status page: `/status`
3. Check browser console for errors
4. Check `vercel logs` for backend errors

## 🎓 Learning Resources

- **Next.js:** https://nextjs.org/docs
- **Express:** https://expressjs.com/
- **TypeScript:** https://www.typescriptlang.org/docs/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Strava API:** https://developers.strava.com/

## 📈 Next Steps

1. **Deploy to Production** - See DEPLOY_NOW.md
2. **Test Live** - Sign up, connect Strava, share QR code
3. **Gather Feedback** - Share with beta users
4. **Iterate** - Build Phase 2 features based on feedback

## 📄 License

MVP built in 12-hour sprint - Feb 2026

---

**Questions?** See the relevant documentation file or check the Status page at `/status`.

**Ready to deploy?** Go to DEPLOY_NOW.md!
