#!/bin/bash

echo "🚀 Starting EikaiwaGrow Demo Setup..."
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
else
    echo "✅ Dependencies already installed"
fi

# Setup database
echo "🗄️ Setting up database..."
npm run db:push
if [ $? -ne 0 ]; then
    echo "❌ Failed to setup database"
    exit 1
fi

echo "🌱 Seeding demo data..."
npx tsx prisma/seed.ts
if [ $? -ne 0 ]; then
    echo "❌ Failed to seed demo data"
    exit 1
fi

echo ""
echo "🎉 Demo setup complete!"
echo "=================================="
echo "✅ Database initialized with demo data"  
echo "✅ All dependencies installed"
echo "✅ Demo mode enabled"
echo ""
echo "🚀 Starting demo server..."
echo "Access your demo at: http://localhost:3000"
echo ""
echo "📖 See DEMO_GUIDE.md for the complete demo script"
echo ""

# Start the development server
npm run dev