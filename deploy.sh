#!/usr/bin/env bash
set -e

cd ~/xpress-design

git pull

COMPOSE="docker compose -f docker-compose.yml -f docker-compose.prod.yml"

$COMPOSE pull autoheal
$COMPOSE build frontend backend cms
$COMPOSE up -d --force-recreate --remove-orphans frontend backend cms autoheal

# Recreate nginx after app containers are up so upstream names resolve to the
# current containers, avoiding stale upstream connections after deploy.
sleep 10
$COMPOSE up -d --force-recreate nginx

$COMPOSE ps
