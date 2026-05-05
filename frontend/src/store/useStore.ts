import { create } from 'zustand'
import type { WatchlistItem, AlertItem, PriceData, SentimentData } from '@/api/client'

interface AppStore {
  // Live prices keyed by ticker
  prices: Record<string, PriceData>
  setPriceData: (ticker: string, data: PriceData) => void

  // Live sentiment keyed by ticker
  sentiments: Record<string, SentimentData>
  setSentimentData: (ticker: string, data: SentimentData) => void

  // Selected ticker for detail view
  selectedTicker: string
  setSelectedTicker: (t: string) => void

  // Watchlist
  watchlist: WatchlistItem[]
  setWatchlist: (items: WatchlistItem[]) => void

  // Alerts
  alerts: AlertItem[]
  setAlerts: (items: AlertItem[]) => void
  addAlert: (item: AlertItem) => void
  acknowledgeAlert: (id: string) => void

  // Feed events (global live feed)
  feedEvents: any[]
  addFeedEvent: (e: any) => void

  // UI state
  sidebarOpen: boolean
  toggleSidebar: () => void
  liveConnected: boolean
  setLiveConnected: (v: boolean) => void
}

export const useStore = create<AppStore>((set) => ({
  prices: {},
  setPriceData: (ticker, data) =>
    set((s) => ({ prices: { ...s.prices, [ticker]: data } })),

  sentiments: {},
  setSentimentData: (ticker, data) =>
    set((s) => ({ sentiments: { ...s.sentiments, [ticker]: data } })),

  selectedTicker: 'AAPL',
  setSelectedTicker: (t) => set({ selectedTicker: t }),

  watchlist: [],
  setWatchlist: (items) => set({ watchlist: items }),

  alerts: [],
  setAlerts: (items) => set({ alerts: items }),
  addAlert: (item) => set((s) => ({ alerts: [item, ...s.alerts].slice(0, 50) })),
  acknowledgeAlert: (id) =>
    set((s) => ({ alerts: s.alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a) })),

  feedEvents: [],
  addFeedEvent: (e) => set((s) => ({ feedEvents: [e, ...s.feedEvents].slice(0, 100) })),

  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  liveConnected: false,
  setLiveConnected: (v) => set({ liveConnected: v }),
}))
