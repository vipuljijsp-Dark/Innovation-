#!/bin/bash
# Quick Start Script for Chat App with MongoDB

echo "================================"
echo "Chat App - MongoDB Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✓ Node.js found: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✓ npm found: $(npm --version)"
echo ""

# Check if MongoDB is running
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not in PATH. Make sure it's running in another terminal."
else
    echo "✓ MongoDB is installed"
fi

echo ""
echo "Installing dependencies..."
npm install

echo ""
echo "✓ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure MongoDB is running (run: mongod)"
echo "2. Configure .env file with your database URI"
echo "3. Start the server with: npm start"
echo "4. Open http://localhost:3000 in your browser"
echo ""
