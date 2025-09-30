#!/bin/bash
# Script to start the development environment with UV optimizations

echo "🚀 UV-Powered Development Setup"
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

# Install/update dependencies using UV sync for better performance
echo "⚡ Installing dependencies with UV sync (TOML-based)..."
time uv sync --dev

# Show performance comparison
echo ""
echo "🏃‍♂️ Performance Comparison:"
echo "Traditional pip install: ~30-60 seconds"
echo "UV sync:                 ~3-10 seconds (3-10x faster!)"
echo ""

# Start the API server in development mode with auto-reload
echo "🔥 Starting API server in DEVELOPMENT mode with auto-reload"
echo "🌐 Server will be available at: http://localhost:5002"
echo "📁 Auto-reload: Python files will trigger server restart"
echo "🐛 Debug mode: Enhanced error messages enabled"
echo ""

# Run the server in the background and redirect output to logs
uv run python api_server.py --dev > server.log 2>&1 &

# Store the process ID
echo $! > server.pid

echo "✅ Server started in background with PID $(cat server.pid)"
echo "📄 Server logs are being written to server.log"
echo "🛑 To stop the server, run: kill $(cat server.pid)"