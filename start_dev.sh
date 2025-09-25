#!/bin/bash
# Script to start the development environment

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

# Start the API server
echo "Starting API server on http://localhost:5002"
python api_server.py