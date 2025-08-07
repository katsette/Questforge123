#!/bin/bash

# QuestForge Setup Script
echo "🎲 Setting up QuestForge D&D Companion App..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v16 or higher."
    print_info "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)

if [ "$MAJOR_VERSION" -lt 16 ]; then
    print_warning "Node.js version $NODE_VERSION detected. Node.js v16+ recommended."
else
    print_status "Node.js version $NODE_VERSION detected"
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    print_warning "MongoDB is not running. Please start MongoDB:"
    print_info "  sudo systemctl start mongod"
    print_info "  OR use Docker: docker run -d -p 27017:27017 --name mongodb mongo:5.0"
else
    print_status "MongoDB is running"
fi

# Install backend dependencies
print_info "Installing backend dependencies..."
cd backend

if npm install; then
    print_status "Backend dependencies installed successfully"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Create uploads directory
mkdir -p uploads
print_status "Created uploads directory"

# Set up environment file (if it doesn't exist)
if [ ! -f .env ]; then
    cp .env.example .env
    print_status "Created .env file from template"
    print_warning "Please edit .env file with your configuration"
else
    print_info ".env file already exists"
fi

cd ..

# Create logs directory
mkdir -p logs
print_status "Created logs directory"

# Set permissions
chmod +x setup.sh
print_status "Set executable permissions"

echo ""
print_status "QuestForge setup complete!"
echo ""
print_info "Next steps:"
echo "1. Make sure MongoDB is running"
echo "2. Edit backend/.env with your configuration"
echo "3. Start the development server:"
echo "   cd backend && npm run dev"
echo ""
print_info "The server will be available at http://localhost:5000"
print_info "API documentation: http://localhost:5000/api/health"
echo ""
echo "🎲 Happy gaming! Welcome to QuestForge!"
