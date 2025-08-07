#!/bin/bash
set -e  # Exit on any error

echo "🚀 Starting QuestForge build process..."
echo "📍 Current directory: $(pwd)"
echo "📂 Directory contents:"
ls -la

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Build frontend
echo "🎨 Building frontend..."
echo "📍 Changing to frontend directory..."
cd frontend
echo "📍 Frontend directory: $(pwd)"
echo "📂 Frontend directory contents:"
ls -la

echo "📦 Installing frontend dependencies..."
npm ci
echo "🏗️ Building React app..."
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
echo "📂 Build folder contents:"
ls -la build/
echo "📄 Checking for index.html:"
ls -la build/index.html
cd ..

# Install backend dependencies  
echo "🔧 Installing backend dependencies..."
cd backend
npm ci
echo "✅ Backend dependencies installed"
cd ..

echo "🎉 Build process completed successfully!"
echo "📁 Frontend build location: $(pwd)/frontend/build/"
echo "📄 Index.html location: $(pwd)/frontend/build/index.html"
echo "✅ Verifying final paths:"
ls -la frontend/build/index.html
echo "🚀 Ready for deployment!"
