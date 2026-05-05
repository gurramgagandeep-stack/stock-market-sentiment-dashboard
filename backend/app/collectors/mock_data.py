import random
import asyncio
from datetime import datetime, timedelta, timezone
from app.nlp.sentiment import score_sentiment

MOCK_TICKERS = {
    "AAPL": "Apple Inc.", "TSLA": "Tesla Inc.", "GOOGL": "Alphabet Inc.",
    "MSFT": "Microsoft Corp.", "AMZN": "Amazon.com Inc.", "NVDA": "NVIDIA Corp.",
    "META": "Meta Platforms", "NFLX": "Netflix Inc.", "AMD": "Advanced Micro Devices",
    "RELIANCE": "Reliance Industries", "TCS": "Tata Consultancy Services",
    "INFY": "Infosys Ltd.", "WIPRO": "Wipro Ltd.", "HDFCBANK": "HDFC Bank",
}

MOCK_HEADLINES = {
    "positive": [
        "{ticker} beats Q3 earnings estimates by 12%, revenue up 18% YoY",
        "{ticker} stock surges after analyst upgrades to Strong Buy with $250 target",
        "{ticker} announces record-breaking quarterly revenue, bullish outlook",
        "{ticker} signs landmark deal worth $5B, investors cheer",
        "{ticker} raises full-year guidance, citing strong demand",
        "{ticker} new product launch exceeds expectations in global markets",
        "Institutional investors increase {ticker} holdings by 8% this quarter",
    ],
    "negative": [
        "{ticker} misses revenue estimates, shares fall 6% in after-hours trading",
        "{ticker} CEO resigns amid restructuring, stock drops sharply",
        "{ticker} faces regulatory probe, trading halted briefly",
        "{ticker} lowers annual forecast due to supply chain disruptions",
        "Short sellers increase bets against {ticker} by 15%",
        "{ticker} loses key contract, revenue impact estimated at $2B",
        "Analyst downgrades {ticker} to Sell amid macro headwinds",
    ],
    "neutral": [
        "{ticker} releases quarterly earnings report in line with expectations",
        "{ticker} board approves routine share buyback program",
        "{ticker} announces new VP of Engineering hire",
        "Analysts maintain Hold rating on {ticker} ahead of product launch",
        "{ticker} to present at upcoming tech conference next month",
        "{ticker} files standard 10-K with SEC for fiscal year",
    ],
}

MOCK_SOCIAL = {
    "positive": [
        "${{ticker}} is absolutely flying! This chart is beautiful 🚀",
        "Loaded up more ${{ticker}} today. Long term conviction play. #bullish",
        "${{ticker}} fundamentals are rock solid. Holding through any dip.",
        "My ${{ticker}} calls are printing 💰 What a day!",
        "Breaking: ${{ticker}} just announced massive share buyback. BULLISH!",
    ],
    "negative": [
        "${{ticker}} about to fall off a cliff. Get out now while you can.",
        "Selling all my ${{ticker}} today. This management is a disaster.",
        "${{ticker}} puts are going to print. Chart looks terrible.",
        "Dumped ${{ticker}} last week. Best decision I made this year.",
        "${{ticker}} is overvalued by any metric. Short it.",
    ],
    "neutral": [
        "Watching ${{ticker}} closely. Will decide after earnings.",
        "What do you all think about ${{ticker}} at current levels?",
        "${{ticker}} holding steady. No major moves expected this week.",
        "Added ${{ticker}} to my watchlist. Doing more research.",
    ],
}

SOURCES = ["twitter", "reddit", "news"]

BASE_PRICES = {
    "AAPL": 178.5, "TSLA": 245.3, "GOOGL": 175.2, "MSFT": 415.8,
    "AMZN": 185.6, "NVDA": 875.4, "META": 485.2, "NFLX": 625.3,
    "AMD": 165.4, "RELIANCE": 2850.0, "TCS": 4125.0,
    "INFY": 1620.0, "WIPRO": 485.0, "HDFCBANK": 1625.0,
}

_price_state: dict = {}

def get_mock_price(ticker: str) -> dict:
    base = BASE_PRICES.get(ticker, 100.0)
    if ticker not in _price_state:
        _price_state[ticker] = base
    prev = _price_state[ticker]
    change = prev * random.uniform(-0.008, 0.012)
    close = round(prev + change, 2)
    _price_state[ticker] = close
    change_pct = round((close - base) / base * 100, 2)
    return {
        "ticker": ticker, "open": round(close * 0.998, 2),
        "high": round(close * 1.005, 2), "low": round(close * 0.994, 2),
        "close": close, "volume": random.randint(5_000_000, 50_000_000),
        "change_pct": change_pct,
    }

def get_mock_sentiment_event(ticker: str) -> dict:
    sentiment_type = random.choices(["positive", "negative", "neutral"], weights=[45, 25, 30])[0]
    source = random.choice(SOURCES)
    if source == "news":
        templates = MOCK_HEADLINES[sentiment_type]
        text = random.choice(templates).format(ticker=ticker)
    else:
        templates = MOCK_SOCIAL[sentiment_type]
        text = random.choice(templates).replace("{ticker}", ticker)
    result = score_sentiment(text)
    return {
        "ticker": ticker, "source": source, "raw_text": text,
        "sentiment_label": result["label"], "sentiment_score": result["score"],
        "model_used": "vader",
    }

def generate_historical_sentiment(ticker: str, hours: int = 24) -> list:
    events = []
    now = datetime.now(timezone.utc)
    for i in range(hours * 4):
        ts = now - timedelta(minutes=15 * i)
        sentiment = random.uniform(-0.8, 0.9)
        events.append({
            "timestamp": ts.isoformat(),
            "score": round(sentiment, 4),
            "volume": random.randint(5, 45),
        })
    return list(reversed(events))

def generate_historical_prices(ticker: str, hours: int = 24) -> list:
    base = BASE_PRICES.get(ticker, 100.0)
    prices = []
    now = datetime.now(timezone.utc)
    price = base
    for i in range(hours * 4):
        ts = now - timedelta(minutes=15 * i)
        change = price * random.uniform(-0.005, 0.007)
        price = round(price + change, 2)
        prices.append({"timestamp": ts.isoformat(), "close": price, "volume": random.randint(1_000_000, 10_000_000)})
    return list(reversed(prices))
