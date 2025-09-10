#!/bin/bash

# redeploy.sh - Redeploy md2any Docker container
# Usage: ./redeploy.sh [port]
# Default port is 5002

PORT=${1:-5002}
IMAGE_NAME="lifuyi/md2any:latest"
CONTAINER_NAME="md2any"

echo "Redeploying md2any container on port $PORT..."

# Step 1: Find Docker container ID on specified port
echo "1. Finding Docker container on port $PORT..."
CONTAINER_ID=$(docker ps -q -f publish=$PORT)

if [ -z "$CONTAINER_ID" ]; then
    echo "   No container found on port $PORT"
else
    echo "   Found container ID: $CONTAINER_ID"
    
    # Step 2: Kill the container
    echo "2. Killing container $CONTAINER_ID..."
    docker kill $CONTAINER_ID
    if [ $? -eq 0 ]; then
        echo "   Container killed successfully"
    else
        echo "   Failed to kill container"
        exit 1
    fi
    
    # Step 3: Remove the container
    echo "3. Removing container $CONTAINER_ID..."
    docker rm $CONTAINER_ID
    if [ $? -eq 0 ]; then
        echo "   Container removed successfully"
    else
        echo "   Failed to remove container"
        exit 1
    fi
fi

# Step 4: Remove the image
echo "4. Removing image $IMAGE_NAME..."
docker rmi $IMAGE_NAME
if [ $? -eq 0 ] || [ $? -eq 1 ]; then  # 0 = success, 1 = image not found (acceptable)
    echo "   Image removal completed"
else
    echo "   Failed to remove image"
    exit 1
fi

# Step 5: Run new container
echo "5. Running new container..."
docker run -d -p $PORT:5002 --name $CONTAINER_NAME $IMAGE_NAME
if [ $? -eq 0 ]; then
    echo "   New container started successfully"
    echo "   Container name: $CONTAINER_NAME"
    echo "   Port mapping: $PORT:5002"
else
    echo "   Failed to start new container"
    exit 1
fi

echo "Redeployment completed successfully!"