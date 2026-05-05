import asyncio
import json
import random
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path

import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import router
from app.collectors.mock_data import get_mock_price, get_mock_sentiment_event, MOCK_TICKERS

# ── Socket.IO ─────────────────────────────────────────────────────────────────
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    logger=False,
    engineio_logger=False,
)

connected_clients: set = set()

@sio.event
async def connect(sid, environ):
    connected_clients.add(sid)

@sio.event
async def disconnect(sid):
    connected_clients.discard(sid)

@sio.event
async def subscribe_ticker(sid, data):
    ticker = data.get("ticker", "").upper()
    await sio.enter_room(sid, f"ticker_{ticker}")

@sio.event
async def unsubscribe_ticker(sid, data):
    ticker = data.get("ticker", "").upper()
    await sio.leave_room(sid, f"ticker_{ticker}")

# ── Background tasks ──────────────────────────────────────────────────────────
async def price_broadcast_loop():
    tickers = list(MOCK_TICKERS.keys())
    while True:
        try:
            for ticker in random.sample(tickers, min(5, len(tickers))):
                price = get_mock_price(ticker)
                price["timestamp"] = datetime.now(timezone.utc).isoformat()
                await sio.emit("price_update", price, room=f"ticker_{ticker}")
                await sio.emit("price_update", price)
        except Exception:
            pass
        await asyncio.sleep(3)

async def sentiment_broadcast_loop():
    tickers = list(MOCK_TICKERS.keys())
    while True:
        try:
            ticker = random.choice(tickers)
            event = get_mock_sentiment_event(ticker)
            event["timestamp"] = datetime.now(timezone.utc).isoformat()
            event["id"] = str(random.randint(100000, 999999))
            await sio.emit("sentiment_update", event, room=f"ticker_{ticker}")
            await sio.emit("sentiment_update", event)
            await sio.emit("aggregate_update", {
                "ticker": ticker,
                "score": round(event["sentiment_score"] + random.uniform(-0.05, 0.05), 4),
                "momentum": round(random.uniform(-0.1, 0.1), 4),
                "timestamp": event["timestamp"],
            })
        except Exception:
            pass
        await asyncio.sleep(5)

@asynccontextmanager
async def lifespan(app: FastAPI):
    t1 = asyncio.create_task(price_broadcast_loop())
    t2 = asyncio.create_task(sentiment_broadcast_loop())
    yield
    t1.cancel()
    t2.cancel()

# ── FastAPI App ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="Stock Sentiment Dashboard API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}

# ── Serve Frontend ────────────────────────────────────────────────────────────
frontend_dist = Path(__file__).parent.parent / "frontend_dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")

# ── Wrap with Socket.IO ASGI (must be last) ───────────────────────────────────
app = socketio.ASGIApp(sio, other_asgi_app=app)