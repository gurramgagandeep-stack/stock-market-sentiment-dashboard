@echo off
echo Starting SentimentIQ...
if not exist .env copy .env.example .env
docker compose up --build
