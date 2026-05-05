/// <reference types="vite/client" />
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 10000,
})

// ── Types ─────────────────────────────────────────────────────────────────────
export interface PriceData {
  ticker: string; open: number; high: number; low: number
  close: number; volume: number; change_pct: number; timestamp?: string
}
export interface SentimentData {
  ticker: string; score: number; label: string; momentum: number
  timestamp: string; positive_pct: number; negative_pct: number; neutral_pct: number
  source_breakdown: { news: number; twitter: number; reddit: number }
}
export interface SentimentEvent {
  id: string; ticker: string; source: string; raw_text: string
  sentiment_label: string; sentiment_score: number; timestamp: string
}
export interface TrendingItem {
  ticker: string; company: string; score: number
  label: string; volume: number; change_pct: number
}
export interface WatchlistItem {
  ticker: string; company_name: string; alert_low: number; alert_high: number
  price?: PriceData; sentiment?: SentimentData
}
export interface AlertItem {
  id: string; ticker: string; message: string; score: number
  timestamp: string; acknowledged: boolean; type: string
}
export interface OverviewStats {
  total_signals_today: number; positive_ratio: number; negative_ratio: number
  neutral_ratio: number; most_bullish: string; most_bearish: string; market_mood: string
}

// ── API calls ─────────────────────────────────────────────────────────────────
export const getPrice = (ticker: string) => api.get<PriceData>(`/prices/${ticker}`)
export const getPriceHistory = (ticker: string, hours = 24) => api.get(`/prices/${ticker}/history?hours=${hours}`)
export const getAllPrices = (tickers: string) => api.get<PriceData[]>(`/prices?tickers=${tickers}`)
export const getSentiment = (ticker: string) => api.get<SentimentData>(`/sentiment/${ticker}`)
export const getSentimentHistory = (ticker: string, hours = 24) => api.get(`/sentiment/${ticker}/history?hours=${hours}`)
export const getSentimentFeed = (ticker: string, limit = 20) => api.get<SentimentEvent[]>(`/sentiment/${ticker}/feed?limit=${limit}`)
export const getTrending = () => api.get<TrendingItem[]>('/trending')
export const getWatchlist = () => api.get<WatchlistItem[]>('/watchlist')
export const addToWatchlist = (ticker: string) => api.post('/watchlist', { ticker })
export const removeFromWatchlist = (ticker: string) => api.delete(`/watchlist/${ticker}`)
export const getAlerts = () => api.get<AlertItem[]>('/alerts')
export const acknowledgeAlert = (id: string) => api.patch(`/alerts/${id}/acknowledge`)
export const searchTickers = (q: string) => api.get<{ ticker: string; company: string }[]>(`/search?q=${q}`)
export const getOverview = () => api.get<OverviewStats>('/overview')

