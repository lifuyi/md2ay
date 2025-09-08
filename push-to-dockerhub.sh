#!/bin/bash

# Script to push the production Docker image to Docker Hub

set -e  # Exit on any error

IMAGE_NAME="lifuyi/md2any"
TAG="latest"

echo "🚀 Preparing to push $IMAGE_NAME:$TAG to Docker Hub"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if the image exists locally
if ! docker images | grep -q "$IMAGE_NAME.*$TAG"; then
    echo "❌ Image $IMAGE_NAME:$TAG not found locally."
    echo "Please build the image first using:"
    echo "docker build -t $IMAGE_NAME:$TAG -f Dockerfile.prod ."
    exit 1
fi



# Push the image
echo "⬆️  Pushing $IMAGE_NAME:$TAG to Docker Hub..."
docker push $IMAGE_NAME:$TAG

echo "✅ Image successfully pushed to Docker Hub!"
echo "🎉 $IMAGE_NAME:$TAG is now available for public use."

# Show image details
echo ""
echo "📋 Image details:"
docker images $IMAGE_NAME:$TAG