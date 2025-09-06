#!/bin/sh

# Exit on any error
set -e

echo "Starting EikaiwaGrow application..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
until npx prisma db push --skip-generate; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready!"

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client (if not already done)
echo "Generating Prisma client..."
npx prisma generate

# Seed database if needed (only in development)
if [ "$NODE_ENV" = "development" ]; then
  echo "Seeding database..."
  npm run db:seed || true
fi

echo "Starting Next.js application..."
exec "$@"