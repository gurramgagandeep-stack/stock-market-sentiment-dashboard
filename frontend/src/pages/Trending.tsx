import React, { useEffect, useState } from 'react'
import { TrendingUp, RefreshCw } from 'lucide-react'
import { getTrending } from '@/api/client'
import { useStore } from '@/store/useStore'
import { ChangeChip, Spinner } from '@/components/ui'
import clsx from 'clsx'

function scoreToColor(score: number): string {
  if (score >= 0.5)  return 'bg-emerald-500 text-white'
  if (score >= 0.2)  return 'bg-emerald-300 text-emerald-900'
  if (score >= 0.05) return 'bg-green-100 text-green-800'
  if (score <= -0.5) return 'bg-red-500 text-white'
  if (score <= -0.2) return 'bg-red-300 text-red-900'
  if (score <= -0.05)return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-700'
}

export function TrendingPage() {
  const { setSelectedTicker } = useStore()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'volume' | 'score' | 'change'>('volume')

  const load = async () => {
    try {
      setLoading(true)
      const res = await getTrending()
      setData(res.data)
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const sorted = [...data].sort((a, b) => {
    if (sortBy === 'volume') return b.volume - a.volume
    if (sortBy === 'score')  return Math.abs(b.score) - Math.abs(a.score)
    return Math.abs(b.change_pct) - Math.abs(a.change_pct)
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp size={20} className="text-brand-500" />
          <h1 className="text-xl font-bold text-gray-900">Trending Tickers</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-surface-100 rounded-xl p-1">
            {(['volume', 'score', 'change'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  sortBy === s ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500'}`}>
                {s}
              </button>
            ))}
          </div>
          <button onClick={load} className="btn-ghost flex items-center gap-1.5">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-5 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500" /> Strong Positive</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-100" /> Mild Positive</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-100" /> Neutral</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100" /> Mild Negative</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500" /> Strong Negative</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={28} /></div>
      ) : (
        <>
          {/* Heatmap grid */}
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3 mb-8">
            {sorted.map(item => (
              <button key={item.ticker} onClick={() => { setSelectedTicker(item.ticker); window.location.href = '/' }}
                className={clsx('rounded-2xl p-3 text-center transition-transform hover:scale-105 active:scale-95 cursor-pointer', scoreToColor(item.score))}>
                <p className="font-bold text-base leading-tight">{item.ticker}</p>
                <p className="text-[10px] opacity-80 mt-0.5 truncate">{item.company.split(' ')[0]}</p>
                <p className="font-semibold text-sm mt-1">{item.score > 0 ? '+' : ''}{item.score.toFixed(2)}</p>
                <p className="text-[10px] opacity-70 mt-0.5">{item.volume.toLocaleString()} signals</p>
              </button>
            ))}
          </div>

          {/* Table view */}
          <div className="card overflow-hidden p-0">
            <div className="px-5 py-3 border-b border-surface-200 bg-surface-50">
              <h3 className="text-sm font-semibold text-gray-700">Detailed Rankings</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100">
                  {['#', 'Ticker', 'Company', 'Sentiment Score', 'Signal Volume', 'Price Change'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 px-5 py-3 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.slice(0, 10).map((item, i) => (
                  <tr key={item.ticker} className="border-b border-surface-50 hover:bg-surface-50 cursor-pointer"
                    onClick={() => { setSelectedTicker(item.ticker); window.location.href = '/' }}>
                    <td className="px-5 py-3 text-sm text-gray-400 font-medium">{i + 1}</td>
                    <td className="px-5 py-3 font-bold text-gray-900 text-sm">{item.ticker}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{item.company}</td>
                    <td className="px-5 py-3">
                      <span className={clsx('text-sm font-bold', item.score >= 0.05 ? 'text-positive' : item.score <= -0.05 ? 'text-negative' : 'text-neutral')}>
                        {item.score > 0 ? '+' : ''}{item.score.toFixed(3)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{item.volume.toLocaleString()}</td>
                    <td className="px-5 py-3"><ChangeChip value={item.change_pct} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
