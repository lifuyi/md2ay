#!/bin/bash

# Multi-arch Docker build script for md2any
# Supports both AMD64 and ARM64 architectures

set -e  # Exit on any error

# Configuration
IMAGE_NAME="lifuyi/md2any"
TAG="latest"
BUILDER_NAME="multiarch-builder"

echo "🚀 Starting multi-arch build for $IMAGE_NAME:$TAG"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if buildx is available
if ! docker buildx version >/dev/null 2>&1; then
    echo "❌ Docker Buildx is not available."
    exit 1
fi



# Check if the builder exists and is running
if ! docker buildx ls | grep -q "$BUILDER_NAME.*running"; then
    echo "🔄 Creating and booting buildx builder: $BUILDER_NAME"
    docker buildx create --name $BUILDER_NAME --use --bootstrap
else
    echo "✅ Using existing buildx builder: $BUILDER_NAME"
    docker buildx use $BUILDER_NAME
fi

# Build and push multi-arch image
echo "🏗️  Building multi-arch image for platforms: linux/amd64, linux/arm64"

docker buildx build \
    --platform linux/amd64,linux/arm64 \
    --tag $IMAGE_NAME:$TAG \
    --file Dockerfile.prod \
    --push \
    .

echo "✅ Multi-arch build completed successfully!"

# Inspect the image manifest
echo "🔍 Inspecting image manifest:"
docker buildx imagetools inspect $IMAGE_NAME:$TAG

echo "🎉 Multi-arch image $IMAGE_NAME:$TAG has been built and pushed to Docker Hub!"
echo "   Supported architectures: AMD64 (x86_64) and ARM64 (aarch64)"