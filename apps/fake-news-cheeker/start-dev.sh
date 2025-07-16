#!/bin/bash

# Navigate to the backend directory
cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies if requirements.txt is newer than venv
if [ requirements.txt -nt venv/pyvenv.cfg ]; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Start the Flask application
echo "Starting Flask backend server..."
python3 main.py 