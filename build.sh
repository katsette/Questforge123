#!/bin/bash
set -e  # Exit on any error

echo "🚀 Starting QuestForge build process..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Build frontend
echo "🎨 Building frontend..."
cd frontend
npm ci
npm run build
echo "✅ Frontend build complete"

# Check if build folder exists
if [ ! -d "build" ]; then
  echo "❌ Frontend build folder not found!"
  exit 1
fi

if [ ! -f "build/index.html" ]; then
  echo "❌ Frontend index.html not found!"
  exit 1
fi

echo "✅ Frontend build verification passed"
cd ..

# Install backend dependencies  
echo "🔧 Installing backend dependencies..."
cd backend
npm ci
echo "✅ Backend dependencies installed"
cd ..

echo "🎉 Build process completed successfully!"
echo "📁 Frontend build location: frontend/build/"
echo "🚀 Ready for deployment!"
