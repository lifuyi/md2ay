#!/bin/bash
# Script to start the production environment with UV optimizations

echo "🚀 UV-Powered Production Setup"
echo "==============================="

# Check UV version
if command -v uv &> /dev/null; then
    echo "✅ UV version: $(uv --version)"
else
    echo "❌ UV not found. Installing UV..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    source $HOME/.cargo/env
fi

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment with UV..."
    time uv venv
else
    echo "✅ Virtual environment already exists"
fi

# Install/update dependencies using UV sync (production only, no dev deps)
echo "⚡ Installing production dependencies with UV sync..."
time uv sync --no-dev

# Show performance comparison
echo ""
echo "🏃‍♂️ Performance Comparison:"
echo "Traditional pip install: ~20-40 seconds"
echo "UV sync --no-dev:        ~2-8 seconds (5-10x faster!)"
echo ""

# Set production environment variables
export FLASK_ENV=production
export PYTHONOPTIMIZE=1
export PYTHONDONTWRITEBYTECODE=1

# Start the API server in production mode
echo "🚀 Starting API server in PRODUCTION mode"
echo "🌐 Server will be available at: http://localhost:5002"
echo "⚡ Optimizations: FLASK_ENV=production, PYTHONOPTIMIZE=1, PYTHONDONTWRITEBYTECODE=1"
echo "🔒 Security: Debug mode disabled, no auto-reload"
echo ""
uv run python api_server.py