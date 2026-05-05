import asyncio
import json
import random
from datetime import datetime, timezone
from app.tasks.celery_app import celery_app
from app.collectors.mock_data import get_mock_price, get_mock_sentiment_event, MOCK_TICKERS
from app.core.config import settings
import redis as sync_redis

def get_redis():
    return sync_redis.from_url(settings.redis_url, decode_responses=True)

@celery_app.task(name="app.tasks.jobs.refresh_all_prices")
def refresh_all_prices():
    r = get_redis()
    watchlist_raw = r.get("watchlist:tickers")
    tickers = json.loads(watchlist_raw) if watchlist_raw else ["AAPL", "TSLA", "GOOGL", "MSFT", "NVDA"]
    for ticker in tickers:
        price_data = get_mock_price(ticker)
        price_data["timestamp"] = datetime.now(timezone.utc).isoformat()
        r.setex(f"price:{ticker}", 60, json.dumps(price_data))
        r.publish("price_updates", json.dumps({"type": "price", "data": price_data}))
    return f"Refreshed prices for {len(tickers)} tickers"

@celery_app.task(name="app.tasks.jobs.generate_sentiment_feed")
def generate_sentiment_feed():
    r = get_redis()
    watchlist_raw = r.get("watchlist:tickers")
    tickers = json.loads(watchlist_raw) if watchlist_raw else ["AAPL", "TSLA", "GOOGL", "MSFT", "NVDA"]
    ticker = random.choice(tickers)
    event = get_mock_sentiment_event(ticker)
    event["timestamp"] = datetime.now(timezone.utc).isoformat()
    event["id"] = str(random.randint(100000, 999999))
    # Store in rolling list
    r.lpush(f"sentiment:feed:{ticker}", json.dumps(event))
    r.ltrim(f"sentiment:feed:{ticker}", 0, 49)
    r.lpush("sentiment:feed:all", json.dumps(event))
    r.ltrim("sentiment:feed:all", 0, 199)
    # Publish live update
    r.publish("sentiment_updates", json.dumps({"type": "sentiment", "data": event}))
    return f"Generated sentiment for {ticker}"
