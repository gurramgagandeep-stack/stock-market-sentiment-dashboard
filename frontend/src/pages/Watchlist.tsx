import React, { useEffect, useState } from 'react'
import { Star, Plus, Trash2, Search } from 'lucide-react'
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '@/api/client'
import { useStore } from '@/store/useStore'
import { SentimentBadge, ChangeChip, ScoreBar, Spinner } from '@/components/ui'

export function WatchlistPage() {
  const { watchlist, setWatchlist, setSelectedTicker } = useStore()
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newTicker, setNewTicker] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    try {
      setLoading(true)
      const res = await getWatchlist()
      setWatchlist(res.data)
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    if (!newTicker.trim()) return
    try {
      setAdding(true)
      setError('')
      await addToWatchlist(newTicker.trim().toUpperCase())
      setNewTicker('')
      await load()
    } catch { setError('Could not add ticker. Try a valid symbol.') } finally { setAdding(false) }
  }

  const handleRemove = async (ticker: string) => {
    try {
      await removeFromWatchlist(ticker)
      setWatchlist(watchlist.filter(w => w.ticker !== ticker))
    } catch { }
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <Star size={20} className="text-brand-500" />
        <h1 className="text-xl font-bold text-gray-900">Watchlist</h1>
      </div>

      {/* Add ticker */}
      <div className="card mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-3">Add Stock to Watchlist</p>
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Enter ticker (e.g. AAPL)" value={newTicker}
              onChange={e => setNewTicker(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="w-full pl-9 pr-4 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <button onClick={handleAdd} disabled={adding} className="btn-primary flex items-center gap-2">
            {adding ? <Spinner size={14} /> : <Plus size={14} />} Add
          </button>
        </div>
        {error && <p className="text-xs text-negative mt-2">{error}</p>}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={28} /></div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50">
                {['Ticker', 'Company', 'Price', 'Change', 'Sentiment', 'Score', ''].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 px-5 py-3 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {watchlist.map((item, i) => (
                <tr key={item.ticker}
                  className={`border-b border-surface-100 hover:bg-surface-50 transition-colors cursor-pointer ${i % 2 === 0 ? '' : 'bg-surface-50/40'}`}
                  onClick={() => { setSelectedTicker(item.ticker); window.location.href = '/' }}>
                  <td className="px-5 py-4">
                    <span className="font-bold text-gray-900 text-sm">{item.ticker}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-gray-600">{item.company_name}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{item.price?.close?.toFixed(2) ?? '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {item.price ? <ChangeChip value={item.price.change_pct} /> : '—'}
                  </td>
                  <td className="px-5 py-4">
                    {item.sentiment ? <SentimentBadge label={item.sentiment.label} /> : '—'}
                  </td>
                  <td className="px-5 py-4 w-32">
                    {item.sentiment ? (
                      <div className="flex items-center gap-2">
                        <ScoreBar score={item.sentiment.score} />
                        <span className="text-xs font-semibold w-12 text-right">
                          {item.sentiment.score > 0 ? '+' : ''}{item.sentiment.score.toFixed(2)}
                        </span>
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={e => { e.stopPropagation(); handleRemove(item.ticker) }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-negative hover:bg-red-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {watchlist.length === 0 && (
            <div className="py-16 text-center text-gray-400 text-sm">
              No stocks in watchlist. Add one above.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
