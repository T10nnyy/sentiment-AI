#!/bin/bash

# Build and run script with retry logic
set -e

echo "Building Docker containers..."

# Function to retry docker build
retry_build() {
    local dockerfile=$1
    local tag=$2
    local max_attempts=3
    
    for i in $(seq 1 $max_attempts); do
        echo "Build attempt $i for $tag..."
        if docker build -f $dockerfile -t $tag .; then
            echo "Successfully built $tag"
            return 0
        else
            echo "Build attempt $i failed for $tag"
            if [ $i -lt $max_attempts ]; then
                echo "Retrying in 10 seconds..."
                sleep 10
            fi
        fi
    done
    
    echo "All build attempts failed for $tag"
    return 1
}

# Build CPU version
retry_build "Dockerfile" "sentiment-backend:cpu"

# Build GPU version if NVIDIA runtime is available
if docker info | grep -q nvidia; then
    echo "NVIDIA runtime detected, building GPU version..."
    retry_build "Dockerfile.gpu" "sentiment-backend:gpu"
else
    echo "NVIDIA runtime not detected, skipping GPU build"
fi

echo "Starting services..."
docker-compose up -d

echo "Waiting for services to be healthy..."
timeout 300 bash -c 'until docker-compose ps | grep -q "healthy"; do sleep 5; done'

echo "Services are ready!"
docker-compose ps
