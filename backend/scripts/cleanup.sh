#!/bin/bash

# Cleanup script
echo "Stopping and removing containers..."
docker-compose down -v

echo "Removing images..."
docker rmi sentiment-backend:cpu sentiment-backend:gpu 2>/dev/null || true

echo "Cleaning up Docker system..."
docker system prune -f

echo "Cleanup complete!"
