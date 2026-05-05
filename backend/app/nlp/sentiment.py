from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import re

analyzer = SentimentIntensityAnalyzer()

# Finance-specific word boosts
FINANCE_BOOSTER = {
    "beat": 1.5, "miss": -1.5, "surge": 2.0, "crash": -2.0,
    "rally": 1.8, "plunge": -2.0, "soar": 2.0, "tumble": -1.8,
    "bullish": 2.0, "bearish": -2.0, "upgrade": 1.5, "downgrade": -1.5,
    "buyout": 1.2, "bankrupt": -2.5, "record high": 2.0, "record low": -2.0,
    "outperform": 1.5, "underperform": -1.5, "strong buy": 2.0, "strong sell": -2.0,
}

def clean_text(text: str) -> str:
    text = re.sub(r"http\S+|www\S+", "", text)
    text = re.sub(r"@\w+", "", text)
    text = re.sub(r"#(\w+)", r"\1", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:512]

def score_sentiment(text: str) -> dict:
    cleaned = clean_text(text)
    scores = analyzer.polarity_scores(cleaned)
    compound = scores["compound"]

    # Apply finance boosts
    lower = cleaned.lower()
    for phrase, boost in FINANCE_BOOSTER.items():
        if phrase in lower:
            compound = max(-1.0, min(1.0, compound + boost * 0.05))

    if compound >= 0.05:
        label = "positive"
    elif compound <= -0.05:
        label = "negative"
    else:
        label = "neutral"

    return {
        "score": round(compound, 4),
        "label": label,
        "positive": round(scores["pos"], 4),
        "negative": round(scores["neg"], 4),
        "neutral": round(scores["neu"], 4),
    }

def extract_ticker_from_text(text: str, known_tickers: list[str] = None) -> list[str]:
    """Extract $TICKER patterns and match against known tickers."""
    cashtags = re.findall(r'\$([A-Z]{1,5})', text.upper())
    if known_tickers:
        matched = [t for t in cashtags if t in [k.upper() for k in known_tickers]]
        return matched if matched else cashtags
    return cashtags
