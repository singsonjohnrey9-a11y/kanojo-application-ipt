#!/bin/sh
set -e

echo "Running migrations..."
python manage.py migrate --no-input

echo "Seeding sample profiles..."
python manage.py seed_profiles || echo "Seed command failed"

echo "Starting Daphne on port ${PORT:-8000}..."
exec daphne -b 0.0.0.0 -p ${PORT:-8000} config.asgi:application
