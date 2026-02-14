#!/bin/bash

set -e

echo "🧪 Testing Sofin Build..."
echo ""

# Frontend
echo "📦 Building Frontend..."
cd frontend
npm run build
cd ..
echo "✅ Frontend build successful"
echo ""

# Backend
echo "📦 Building Backend..."
cd backend
npm run build
cd ..
echo "✅ Backend build successful"
echo ""

echo "🎉 All builds successful!"
echo ""
echo "Next steps:"
echo "1. Set up environment variables (see .env.example)"
echo "2. Start local database: docker-compose up"
echo "3. Frontend: cd frontend && npm run dev"
echo "4. Backend: cd backend && npm run dev"
