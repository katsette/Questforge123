#!/bin/bash

# QuestForge Application Startup Script
echo "🚀 Starting QuestForge D&D Companion Application..."
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "APPLICATION_STATUS.md" ]; then
    echo "❌ Error: Please run this script from the QuestForge root directory"
    exit 1
fi

# Kill any existing instances
echo "🧹 Cleaning up any existing instances..."
pkill -f "node.*server.js" 2>/dev/null
pkill -f "serve.*build" 2>/dev/null
sleep 2

# Start Backend Server
echo "📡 Starting Backend Server (Port 5000)..."
cd backend
npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Test backend
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ Backend server is running (PID: $BACKEND_PID)"
else
    echo "❌ Backend failed to start. Check backend.log"
    exit 1
fi

# Start Frontend Server
echo "🌐 Starting Frontend Server (Port 3000)..."
cd frontend
npx serve -s build -l 3000 > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "⏳ Waiting for frontend to initialize..."
sleep 3

# Test frontend
if curl -s -I http://localhost:3000 > /dev/null; then
    echo "✅ Frontend server is running (PID: $FRONTEND_PID)"
else
    echo "❌ Frontend failed to start. Check frontend.log"
    exit 1
fi

# Final status check
echo ""
echo "🎉 QuestForge Application Successfully Started!"
echo "=============================================="
echo "📡 Backend API:    http://localhost:5000"
echo "🌐 Frontend App:   http://localhost:3000"
echo "🏥 Health Check:   http://localhost:5000/api/health"
echo ""
echo "📊 Process IDs:"
echo "   Backend PID:    $BACKEND_PID"
echo "   Frontend PID:   $FRONTEND_PID"
echo ""
echo "📝 Logs:"
echo "   Backend:        backend.log"  
echo "   Frontend:       frontend.log"
echo ""
echo "🛑 To stop the application, run: ./stop-application.sh"
echo "🧪 To run tests, execute: node test-full-app.js"
echo ""
echo "✅ Application is ready for use!"

# Save PIDs for stop script
echo "$BACKEND_PID" > .backend_pid
echo "$FRONTEND_PID" > .frontend_pid
