#!/bin/bash

# Deploy script untuk VPS
# Usage: ./scripts/deploy-vps.sh [branch]

BRANCH=${1:-main}

echo "🚀 Starting deployment..."

# Pull latest code
echo "📦 Pulling latest code from $BRANCH..."
git pull origin $BRANCH

# Restart containers
echo "🔄 Restarting containers..."
docker compose restart app

# Clear cache
echo "🧹 Clearing Laravel cache..."
docker compose exec app php artisan optimize:clear

# Rebuild cache
echo "⚡ Rebuilding cache..."
docker compose exec app php artisan optimize

echo "✅ Deployment complete!"
echo ""
echo "📊 Container status:"
docker compose ps