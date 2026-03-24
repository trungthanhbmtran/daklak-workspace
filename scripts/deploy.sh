#!/bin/bash

# Deployment Script for VPS
# Usage: ./deploy.sh [staging|production]

ENV=$1
if [ -z "$ENV" ]; then
    ENV="staging"
fi

COMPOSE_FILE="docker-compose.staging.yml"
if [ "$ENV" == "production" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
fi

echo "🚀 Deploying to $ENV environment using $COMPOSE_FILE..."

# 1. Pull latest images
echo "📥 Pulling latest images..."
docker compose -f $COMPOSE_FILE pull

# 2. Run Migrations (Manual or automated)
# You can check for flags or just run all required ones
echo "🔄 Running migrations..."
SERVICES_WITH_MIGRATIONS=("user-service" "hrm-service" "media-service" "posts-service")

for SERVICE in "${SERVICES_WITH_MIGRATIONS[@]}"; do
    echo "Running migration for $SERVICE..."
    docker compose -f $COMPOSE_FILE --profile migrate run --rm "${SERVICE}-migrate" || { echo "❌ Migration failed for $SERVICE. Stopping."; exit 1; }
done

# 3. Start/Restart services
echo "🆙 Starting services..."
docker compose -f $COMPOSE_FILE up -d

# 4. Cleanup
echo "🧹 Cleaning up old images..."
docker system prune -f

echo "✅ Deployment finished successfully!"
