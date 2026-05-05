#!/bin/bash
set -e
echo "🚀 Starting SentimentIQ..."
cp -n .env.example .env 2>/dev/null || true
docker compose up --build
