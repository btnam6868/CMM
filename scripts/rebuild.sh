#!/bin/bash
echo "🔨 Rebuilding services..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d
echo "✅ Rebuild complete!"
