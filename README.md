# SentimentIQ — Real-Time Stock Market Sentiment Dashboard

A full-stack, real-time stock market sentiment analysis platform.
Combines live financial news, Twitter/X, and Reddit sentiment with
live stock price data — displayed on a Groww-inspired professional dashboard.

---

## ✅ Quick Start (Recommended — Docker)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- That's it!

### Steps

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Start everything (first run downloads images — ~2–3 mins)
docker compose up --build

# 3. Open your browser
#    Frontend:  http://localhost:3000
#    Backend:   http://localhost:8000
#    API Docs:  http://localhost:8000/docs
```

To stop: `docker compose down`

---

## ⚡ Run Without Docker (VS Code Local Dev)

### Prerequisites
- Python 3.11+
- Node.js 20+
- Redis running locally (`redis-server` or use Docker just for Redis)
- PostgreSQL running locally (or SQLite fallback — see below)

### Option A — Redis + PostgreSQL via Docker, code locally

```bash
# Start only the databases
docker compose up postgres redis -d

# ── Backend ──────────────────────────────────────────────
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Set env vars (Windows PowerShell)
$env:DATABASE_URL="postgresql+asyncpg://sentiment_user:sentiment_pass@localhost:5432/sentiment_db"
$env:REDIS_URL="redis://localhost:6379"

# Mac/Linux
export DATABASE_URL="postgresql+asyncpg://sentiment_user:sentiment_pass@localhost:5432/sentiment_db"
export REDIS_URL="redis://localhost:6379"

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# ── Frontend (new terminal) ────────────────────────────────
cd frontend
npm install
npm run dev
```

### Option B — Minimal (no Docker at all)

If you don't want databases, the app runs in demo mode automatically
using in-memory mock data. Just skip the DB env vars:

```bash
# Backend — uses in-memory demo data
cd backend
python -m venv venv && source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Frontend — new terminal
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173 (Vite default) or http://localhost:3000

---

## 🔑 API Keys (Optional)

The dashboard works in **demo mode** without any API keys.
To get real live data, add keys to your `.env` file:

| Key | Where to get it | What it unlocks |
|-----|----------------|-----------------|
| `POLYGON_API_KEY` | [polygon.io](https://polygon.io) — free tier | Real stock prices |
| `TWITTER_BEARER_TOKEN` | [developer.twitter.com](https://developer.twitter.com) | Live tweets |
| `REDDIT_CLIENT_ID` + `REDDIT_CLIENT_SECRET` | [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps) | Reddit posts |

---

## 📁 Project Structure

```
sentiment-dashboard/
├── docker-compose.yml          # Start everything with one command
├── .env.example                # Copy to .env and fill in API keys
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py             # FastAPI app + Socket.IO + background loops
│       ├── api/routes.py       # All REST API endpoints
│       ├── collectors/
│       │   └── mock_data.py    # Demo data generator (used when APIs not configured)
│       ├── nlp/sentiment.py    # VADER sentiment scorer with finance boosts
│       ├── models/models.py    # SQLAlchemy ORM models
│       ├── tasks/
│       │   ├── celery_app.py   # Celery configuration + beat schedule
│       │   └── jobs.py         # Background refresh tasks
│       └── core/
│           ├── config.py       # Pydantic settings
│           └── database.py     # Async SQLAlchemy engine
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── App.tsx             # Router + layout shell
        ├── main.tsx            # React entry point
        ├── index.css           # Tailwind + custom styles
        ├── api/client.ts       # Axios API client + TypeScript types
        ├── hooks/useSocket.ts  # Socket.IO real-time hook
        ├── store/useStore.ts   # Zustand global state
        ├── components/
        │   ├── ui/index.tsx    # Reusable components (Badge, Gauge, etc.)
        │   └── layout/
        │       ├── Sidebar.tsx # Navigation sidebar
        │       └── Topbar.tsx  # Search + header bar
        └── pages/
            ├── Dashboard.tsx   # Main chart + sentiment view
            ├── Watchlist.tsx   # Watchlist management
            ├── Trending.tsx    # Heatmap + leaderboard
            ├── LiveFeed.tsx    # Real-time signal stream
            ├── Alerts.tsx      # Alert management
            └── Analytics.tsx   # Multi-ticker comparison charts
```

---

## 🌐 Pages

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/` | Price + sentiment dual-axis chart, gauge, live feed |
| Watchlist | `/watchlist` | Add/remove stocks, see live price + sentiment |
| Trending | `/trending` | Colour heatmap of top 20 stocks by signal volume |
| Live Feed | `/feed` | Filterable real-time stream of all sentiment events |
| Alerts | `/alerts` | Manage and acknowledge sentiment threshold alerts |
| Analytics | `/analytics` | Radar chart, bar rankings, multi-ticker comparison |

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/prices/{ticker}` | Live price snapshot |
| GET | `/api/prices/{ticker}/history?hours=24` | Price history |
| GET | `/api/sentiment/{ticker}` | Current sentiment score |
| GET | `/api/sentiment/{ticker}/history` | Historical scores |
| GET | `/api/sentiment/{ticker}/feed` | Recent events for ticker |
| GET | `/api/trending` | Top 20 trending tickers |
| GET | `/api/watchlist` | Get watchlist |
| POST | `/api/watchlist` | Add ticker `{ "ticker": "AAPL" }` |
| DELETE | `/api/watchlist/{ticker}` | Remove ticker |
| GET | `/api/alerts` | Get all alerts |
| PATCH | `/api/alerts/{id}/acknowledge` | Acknowledge alert |
| GET | `/api/search?q=AAPL` | Search tickers |
| GET | `/api/overview` | Market overview stats |
| GET | `/docs` | Interactive Swagger UI |

---

## 🛠 Tech Stack

**Backend:** Python 3.11, FastAPI, Socket.IO, Celery, Redis, PostgreSQL, SQLAlchemy, VADER NLP

**Frontend:** React 18, TypeScript, Vite, TailwindCSS, Recharts, Socket.IO Client, Zustand, Axios

**Infrastructure:** Docker, Docker Compose
