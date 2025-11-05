#!/bin/bash
echo "🚀 Deploying to production..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
echo "✅ Deployment complete!"
