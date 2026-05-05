import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { Dashboard } from '@/pages/Dashboard'
import { WatchlistPage } from '@/pages/Watchlist'
import { TrendingPage } from '@/pages/Trending'
import { LiveFeedPage } from '@/pages/LiveFeed'
import { AlertsPage } from '@/pages/Alerts'
import { AnalyticsPage } from '@/pages/Analytics'
import { AuthPage } from '@/pages/AuthPage'
import { useAuthStore } from '@/store/useAuthStore'

function ProtectedLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/trending"  element={<TrendingPage />} />
            <Route path="/feed"      element={<LiveFeedPage />} />
            <Route path="/alerts"    element={<AlertsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="*"          element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const { isAuthenticated, _loadFromStorage } = useAuthStore()

  useEffect(() => { _loadFromStorage() }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />}
        />
        <Route
          path="/*"
          element={isAuthenticated ? <ProtectedLayout /> : <Navigate to="/auth" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}
