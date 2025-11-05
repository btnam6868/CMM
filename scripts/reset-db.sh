#!/bin/bash
echo "⚠️ WARNING: This will delete all data!"
read -p "Are you sure? (yes/no): " confirm
if [ "$confirm" = "yes" ]; then
  docker-compose down -v
  rm -rf postgres-data
  docker-compose up -d postgres
  echo "✅ Database reset complete!"
fi
