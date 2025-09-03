#!/bin/bash

echo "🚀 Fresh Docker build and push to Docker Hub with all fixes..."

# Set variables
DOCKER_USERNAME="lifuyi"
IMAGE_NAME="md2any"
TAG="latest"

echo "📋 Current fixes included:"
echo "   ✅ Preview panel HTML structure fix"
echo "   ✅ API URL construction with fallback"
echo "   ✅ MathJax configuration fix"
echo "   ✅ Theme loading cache-busting"
echo ""

# Stop and clean up existing containers
echo "🧹 Cleaning up existing containers and images..."
docker-compose down 2>/dev/null || true
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Remove old local images
echo "🗑️  Removing old local images..."
docker rmi again-md2any:latest 2>/dev/null || true
docker rmi ${DOCKER_USERNAME}/${IMAGE_NAME}:latest 2>/dev/null || true
docker rmi ${DOCKER_USERNAME}/${IMAGE_NAME}:dev 2>/dev/null || true
docker rmi ${DOCKER_USERNAME}/${IMAGE_NAME}:prod 2>/dev/null || true

# Create and use buildx builder for multi-platform builds
echo "🔧 Setting up Docker buildx for multi-platform builds..."
docker buildx create --name multiarch-builder --use 2>/dev/null || docker buildx use multiarch-builder

# Build and push development version (multi-arch)
echo "🏗️  Building and pushing development version (multi-arch)..."
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag ${DOCKER_USERNAME}/${IMAGE_NAME}:${TAG} \
  --tag ${DOCKER_USERNAME}/${IMAGE_NAME}:dev \
  --push \
  .

# Build and push production version (multi-arch)
echo "🏗️  Building and pushing production version (multi-arch)..."
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --file Dockerfile.prod \
  --tag ${DOCKER_USERNAME}/${IMAGE_NAME}:prod \
  --push \
  .

# Build local development version for testing
echo "🏗️  Building local development version for testing..."
docker-compose build --no-cache

# Start local container for verification
echo "🚀 Starting local container for verification..."
docker-compose up -d

# Wait for service to start
echo "⏳ Waiting for service to start..."
sleep 5

# Test the deployment
echo "🧪 Testing the deployment..."
if curl -s http://localhost:5002/health | grep -q "ok"; then
    echo "✅ Health check: PASSED"
else
    echo "❌ Health check: FAILED"
fi

if curl -s http://localhost:5002/styles | grep -q "css"; then
    echo "✅ Theme loading: PASSED"
else
    echo "❌ Theme loading: FAILED"
fi

echo ""
echo "✅ Successfully built and pushed to Docker Hub!"
echo ""
echo "📦 Available images on Docker Hub:"
echo "   ${DOCKER_USERNAME}/${IMAGE_NAME}:latest (development, multi-arch)"
echo "   ${DOCKER_USERNAME}/${IMAGE_NAME}:dev (development, multi-arch)"
echo "   ${DOCKER_USERNAME}/${IMAGE_NAME}:prod (production, multi-arch)"
echo ""
echo "🚀 To use the updated images:"
echo "   docker pull ${DOCKER_USERNAME}/${IMAGE_NAME}:latest"
echo "   docker run -d -p 5002:5002 ${DOCKER_USERNAME}/${IMAGE_NAME}:latest"
echo ""
echo "🌐 Local test instance running at: http://localhost:5002"
echo "🔗 Docker Hub URL: https://hub.docker.com/r/${DOCKER_USERNAME}/${IMAGE_NAME}"
echo ""
echo "🎯 All fixes included:"
echo "   • Preview panel now uses proper HTML structure"
echo "   • API URLs work with fallback to localhost"
echo "   • MathJax properly configured"
echo "   • Theme loading with cache-busting"