#!/bin/bash

# QuestForge Application Stop Script
echo "🛑 Stopping QuestForge D&D Companion Application..."
echo "===================================================="

# Stop processes using saved PIDs if available
if [ -f ".backend_pid" ]; then
    BACKEND_PID=$(cat .backend_pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "📡 Stopping Backend Server (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        sleep 2
    fi
    rm -f .backend_pid
fi

if [ -f ".frontend_pid" ]; then
    FRONTEND_PID=$(cat .frontend_pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "🌐 Stopping Frontend Server (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        sleep 2
    fi
    rm -f .frontend_pid
fi

# Force kill any remaining processes
echo "🧹 Cleaning up any remaining processes..."
pkill -f "node.*server.js" 2>/dev/null
pkill -f "serve.*build" 2>/dev/null

# Wait a moment for processes to terminate
sleep 2

# Check if ports are free
BACKEND_CHECK=$(netstat -tuln 2>/dev/null | grep ":5000 " | wc -l)
FRONTEND_CHECK=$(netstat -tuln 2>/dev/null | grep ":3000 " | wc -l)

if [ $BACKEND_CHECK -eq 0 ] && [ $FRONTEND_CHECK -eq 0 ]; then
    echo "✅ All QuestForge services stopped successfully"
    echo "   Port 5000 (Backend): Free"
    echo "   Port 3000 (Frontend): Free"
else
    echo "⚠️  Some processes may still be running:"
    if [ $BACKEND_CHECK -gt 0 ]; then
        echo "   Port 5000: Still in use"
    fi
    if [ $FRONTEND_CHECK -gt 0 ]; then
        echo "   Port 3000: Still in use"
    fi
    echo "   You may need to manually kill processes or restart your terminal"
fi

echo ""
echo "🚀 To start the application again, run: ./start-application.sh"
