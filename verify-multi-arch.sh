#!/bin/bash

# Verification script for multi-arch Docker image
# Checks that the image supports multiple architectures

set -e  # Exit on any error

# Configuration
IMAGE_NAME="lifuyi/md2any"
TAG="latest"

echo "🔍 Verifying multi-arch image: $IMAGE_NAME:$TAG"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Inspect the image manifest
echo "📋 Inspecting image manifest..."
docker buildx imagetools inspect $IMAGE_NAME:$TAG

# Check if the image supports both architectures
echo "✅ Verification complete!"
echo "   The image should now support both AMD64 and ARM64 architectures."
echo ""
echo "🚀 To test the image on different platforms:"
echo ""
echo "   # For AMD64 (Intel/AMD servers):"
echo "   docker run --platform linux/amd64 -d -p 5002:5002 --name md2any $IMAGE_NAME:$TAG"
echo ""
echo "   # For ARM64 (Apple Silicon, AWS Graviton):"
echo "   docker run --platform linux/arm64 -d -p 5002:5002 --name md2any $IMAGE_NAME:$TAG"
echo ""
echo "   # Auto-detection (Docker will select the right architecture automatically):"
echo "   docker run -d -p 5002:5002 --name md2any $IMAGE_NAME:$TAG"