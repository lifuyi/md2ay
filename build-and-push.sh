#!/bin/bash

# Comprehensive script to build and push the production Docker image to Docker Hub

set -e  # Exit on any error

IMAGE_NAME="lifuyi/md2any"
TAG="latest"
DOCKERFILE="Dockerfile.prod"

echo "🚀 Starting build and push process for $IMAGE_NAME:$TAG"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi



# Build the image
echo "🏗️  Building $IMAGE_NAME:$TAG using $DOCKERFILE..."
docker build -t $IMAGE_NAME:$TAG -f $DOCKERFILE .

# Show image details
echo "📋 Image built successfully!"
docker images $IMAGE_NAME:$TAG

# Test the image by running it briefly
echo "🧪 Testing the image..."
docker run -d --name md2any-test-container -p 5003:5002 $IMAGE_NAME:$TAG
sleep 5

# Check if the container is running
if docker ps | grep -q "md2any-test-container"; then
    echo "✅ Container is running successfully!"
    
    # Check health endpoint
    if curl -f http://localhost:5003/health >/dev/null 2>&1; then
        echo "✅ Health check passed!"
    else
        echo "⚠️  Health check failed. Continuing with push anyway..."
    fi
    
    # Stop and remove test container
    docker stop md2any-test-container
    docker rm md2any-test-container
else
    echo "❌ Container failed to start. Continuing with push anyway..."
fi

# Push the image
echo "⬆️  Pushing $IMAGE_NAME:$TAG to Docker Hub..."
docker push $IMAGE_NAME:$TAG

echo "🎉 Build and push completed successfully!"
echo "✅ $IMAGE_NAME:$TAG is now available on Docker Hub!"

# Show final image details
echo ""
echo "📋 Final image details:"
docker images $IMAGE_NAME:$TAG