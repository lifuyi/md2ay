#!/bin/bash
# Script to start the production environment

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    uv venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install/update dependencies
echo "Installing dependencies..."
uv pip install -r requirements.txt

# Set production environment variables
export FLASK_ENV=production
export PYTHONOPTIMIZE=1

# Start the API server in production mode
echo "Starting API server in PRODUCTION mode on http://localhost:5002"
echo "Production optimizations: FLASK_ENV=production, PYTHONOPTIMIZE=1"
python api_server.py