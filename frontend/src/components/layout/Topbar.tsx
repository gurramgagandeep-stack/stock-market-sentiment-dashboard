import React, { useState, useEffect, useRef } from 'react'
import { Search, Bell, LogOut, ChevronDown } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useAuthStore } from '@/store/useAuthStore'
import { searchTickers } from '@/api/client'
import { LiveDot } from '@/components/ui'

export function Topbar() {
  const { liveConnected, setSelectedTicker, alerts } = useStore()
  const { currentUser, logout } = useAuthStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ ticker: string; company: string }[]>([])
  const [open, setOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)
  const unread = alerts.filter(a => !a.acknowledged).length

  useEffect(() => {
    if (query.length < 1) { setResults([]); return }
    const t = setTimeout(async () => {
      try {
        const res = await searchTickers(query)
        setResults(res.data)
        setOpen(true)
      } catch {}
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setOpen(false)
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (ticker: string) => {
    setSelectedTicker(ticker)
    setQuery('')
    setOpen(false)
    window.location.hash = ''
  }

  return (
    <header className="h-16 bg-white border-b border-surface-200 flex items-center px-6 gap-4 flex-shrink-0">
      {/* Search */}
      <div ref={searchRef} className="relative flex-1 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search stocks… (AAPL, TSLA)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-surface-50 border border-surface-200 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent
                     placeholder:text-gray-400"
        />
        {open && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface-200 rounded-xl shadow-elevated z-50 overflow-hidden">
            {results.map(r => (
              <button key={r.ticker} onClick={() => handleSelect(r.ticker)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-50 text-left transition-colors">
                <span className="text-sm font-bold text-brand-600 w-14">{r.ticker}</span>
                <span className="text-sm text-gray-500 truncate">{r.company}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1" />

      <LiveDot connected={liveConnected} />

      {/* Alerts bell */}
      <button className="relative p-2 rounded-xl hover:bg-surface-100 text-gray-500 transition-colors">
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {/* User menu */}
      <div ref={userRef} className="relative">
        <button
          onClick={() => setUserMenuOpen(v => !v)}
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-surface-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {currentUser?.avatar || 'U'}
          </div>
          <span className="text-sm font-semibold text-gray-700 hidden sm:block max-w-[120px] truncate">
            {currentUser?.name || 'User'}
          </span>
          <ChevronDown size={14} className="text-gray-400" />
        </button>

        {userMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-surface-200 rounded-2xl shadow-elevated z-50 overflow-hidden fade-up">
            {/* User info */}
            <div className="px-4 py-3 border-b border-surface-100">
              <p className="text-sm font-bold text-gray-900">{currentUser?.name}</p>
              <p className="text-xs text-gray-400 truncate">{currentUser?.email}</p>
            </div>
            {/* Logout */}
            <button
              onClick={() => { logout(); setUserMenuOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
