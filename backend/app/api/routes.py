from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import json, random
from datetime import datetime, timezone
from app.collectors.mock_data import (
    get_mock_price, MOCK_TICKERS,
    generate_historical_sentiment, generate_historical_prices,
    get_mock_sentiment_event,
)

router = APIRouter()

# ── Schemas ───────────────────────────────────────────────────────────────────
class WatchlistItem(BaseModel):
    ticker: str
    alert_low: Optional[float] = -0.5
    alert_high: Optional[float] = 0.5

# ── Prices ───────────────────────────────────────────────────────────────────
@router.get("/prices/{ticker}")
async def get_price(ticker: str):
    ticker = ticker.upper()
    return get_mock_price(ticker)

@router.get("/prices/{ticker}/history")
async def get_price_history(ticker: str, hours: int = 24):
    return generate_historical_prices(ticker.upper(), min(hours, 168))

@router.get("/prices")
async def get_all_prices(tickers: str = "AAPL,TSLA,GOOGL,MSFT,NVDA"):
    ticker_list = [t.strip().upper() for t in tickers.split(",")]
    return [get_mock_price(t) for t in ticker_list]

# ── Sentiment ─────────────────────────────────────────────────────────────────
@router.get("/sentiment/{ticker}")
async def get_sentiment(ticker: str):
    ticker = ticker.upper()
    history = generate_historical_sentiment(ticker, 1)
    latest = history[-1] if history else {"score": 0.0, "timestamp": datetime.now(timezone.utc).isoformat()}
    score = latest["score"]
    label = "positive" if score >= 0.05 else ("negative" if score <= -0.05 else "neutral")
    prev_score = history[-4]["score"] if len(history) >= 4 else score
    momentum = round(score - prev_score, 4)
    return {
        "ticker": ticker,
        "score": round(score, 4),
        "label": label,
        "momentum": momentum,
        "timestamp": latest["timestamp"],
        "positive_pct": random.randint(35, 65),
        "negative_pct": random.randint(15, 35),
        "neutral_pct": random.randint(10, 25),
        "source_breakdown": {
            "news": random.randint(25, 40),
            "twitter": random.randint(35, 50),
            "reddit": random.randint(15, 30),
        },
    }

@router.get("/sentiment/{ticker}/history")
async def get_sentiment_history(ticker: str, hours: int = 24):
    return generate_historical_sentiment(ticker.upper(), min(hours, 168))

@router.get("/sentiment/{ticker}/feed")
async def get_sentiment_feed(ticker: str, limit: int = 20):
    ticker = ticker.upper()
    events = []
    for _ in range(min(limit, 20)):
        e = get_mock_sentiment_event(ticker)
        e["timestamp"] = datetime.now(timezone.utc).isoformat()
        e["id"] = str(random.randint(100000, 999999))
        events.append(e)
    return events

# ── Trending / Heatmap ────────────────────────────────────────────────────────
@router.get("/trending")
async def get_trending():
    results = []
    for ticker, name in MOCK_TICKERS.items():
        score = round(random.uniform(-0.8, 0.9), 3)
        label = "positive" if score >= 0.05 else ("negative" if score <= -0.05 else "neutral")
        results.append({
            "ticker": ticker,
            "company": name,
            "score": score,
            "label": label,
            "volume": random.randint(500, 8000),
            "change_pct": round(random.uniform(-5.0, 7.0), 2),
        })
    results.sort(key=lambda x: abs(x["score"]) * x["volume"], reverse=True)
    return results

# ── Watchlist ─────────────────────────────────────────────────────────────────
_watchlist: dict = {
    "AAPL": {"ticker": "AAPL", "company_name": "Apple Inc.", "alert_low": -0.5, "alert_high": 0.5},
    "TSLA": {"ticker": "TSLA", "company_name": "Tesla Inc.", "alert_low": -0.5, "alert_high": 0.5},
    "GOOGL": {"ticker": "GOOGL", "company_name": "Alphabet Inc.", "alert_low": -0.5, "alert_high": 0.5},
    "NVDA": {"ticker": "NVDA", "company_name": "NVIDIA Corp.", "alert_low": -0.5, "alert_high": 0.5},
    "MSFT": {"ticker": "MSFT", "company_name": "Microsoft Corp.", "alert_low": -0.5, "alert_high": 0.5},
}

@router.get("/watchlist")
async def get_watchlist():
    result = []
    for ticker, item in _watchlist.items():
        price = get_mock_price(ticker)
        sentiment = await get_sentiment(ticker)
        result.append({**item, "price": price, "sentiment": sentiment})
    return result

@router.post("/watchlist")
async def add_to_watchlist(item: WatchlistItem):
    ticker = item.ticker.upper()
    company = MOCK_TICKERS.get(ticker, ticker)
    _watchlist[ticker] = {
        "ticker": ticker, "company_name": company,
        "alert_low": item.alert_low, "alert_high": item.alert_high,
    }
    return {"status": "added", "ticker": ticker}

@router.delete("/watchlist/{ticker}")
async def remove_from_watchlist(ticker: str):
    ticker = ticker.upper()
    if ticker in _watchlist:
        del _watchlist[ticker]
        return {"status": "removed", "ticker": ticker}
    raise HTTPException(status_code=404, detail="Ticker not found")

# ── Alerts ────────────────────────────────────────────────────────────────────
_alerts: list = []

@router.get("/alerts")
async def get_alerts():
    if not _alerts:
        for ticker in ["AAPL", "TSLA", "NVDA"]:
            score = round(random.uniform(-0.8, 0.8), 3)
            _alerts.append({
                "id": str(random.randint(10000, 99999)),
                "ticker": ticker,
                "message": f"{ticker} sentiment crossed threshold ({score:+.2f})",
                "score": score,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "acknowledged": False,
                "type": "positive" if score > 0 else "negative",
            })
    return _alerts

@router.patch("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    for alert in _alerts:
        if alert["id"] == alert_id:
            alert["acknowledged"] = True
            return {"status": "acknowledged"}
    raise HTTPException(status_code=404, detail="Alert not found")

# ── Search ────────────────────────────────────────────────────────────────────
@router.get("/search")
async def search_tickers(q: str):
    q = q.upper()
    results = [
        {"ticker": t, "company": n}
        for t, n in MOCK_TICKERS.items()
        if q in t or q.lower() in n.lower()
    ]
    return results[:8]

# ── Overview Stats ────────────────────────────────────────────────────────────
@router.get("/overview")
async def get_overview():
    return {
        "total_signals_today": random.randint(1200, 3500),
        "positive_ratio": round(random.uniform(0.42, 0.62), 2),
        "negative_ratio": round(random.uniform(0.18, 0.32), 2),
        "neutral_ratio": round(random.uniform(0.15, 0.25), 2),
        "most_bullish": random.choice(["NVDA", "AAPL", "MSFT"]),
        "most_bearish": random.choice(["META", "NFLX", "AMD"]),
        "market_mood": random.choice(["Cautiously Optimistic", "Bullish", "Mixed", "Risk-On"]),
    }
