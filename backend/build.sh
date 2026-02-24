#!/usr/bin/env bash
# Build script for Render — Backend
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Seed sample data if DB is empty
python manage.py seed_profiles --count 15 2>/dev/null || true
