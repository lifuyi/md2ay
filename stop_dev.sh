#!/bin/bash
# Script to stop the development server

if [ -f "server.pid" ]; then
    PID=$(cat server.pid)
    echo "Stopping server with PID $PID..."
    kill $PID
    rm -f server.pid
    echo "✅ Server stopped"
else
    echo "❌ No server.pid file found. Is the server running?"
    echo "💡 You can manually find the process with: ps aux | grep api_server.py"
fi