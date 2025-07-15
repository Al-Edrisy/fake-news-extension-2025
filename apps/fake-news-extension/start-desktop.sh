#!/bin/bash

# Start VeriNews Desktop Application
echo "🚀 Starting VeriNews Desktop..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the desktop application
echo "🖥️  Launching Electron app..."
npm run electron:dev 