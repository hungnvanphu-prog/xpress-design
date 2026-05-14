#!/usr/bin/env bash
set -e

cd ~/xpress-design

git pull

docker compose -f docker-compose.yml -f docker-compose.prod.yml build frontend backend cms
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --force-recreate --remove-orphans frontend backend cms

# Recreate nginx after app containers are up so upstream names resolve to the
# current containers, avoiding stale upstream connections after deploy.
sleep 10
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --force-recreate nginx

docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
