#!/usr/bin/env bash
set -e

# Usage: ./deploy.sh production
# Assumes SSH access to server and repo already cloned

# Stop on error
ENV=${1:-production}
echo "Deploying to $ENV"

# Pull latest from origin
git pull origin main

# Build images and start
docker-compose pull
docker-compose build --no-cache
docker-compose up -d --remove-orphans

# Renew certs (run once manually)
# sudo certbot --nginx -d yourdomain.com

echo "Deployed."

