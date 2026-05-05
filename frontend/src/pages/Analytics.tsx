import React, { useEffect, useState } from 'react'
import { BarChart2, RefreshCw } from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, Cell, LineChart, Line, Legend
} from 'recharts'
import { getTrending, getSentimentHistory } from '@/api/client'
import { Spinner, ChangeChip } from '@/components/ui'

const TICKER_COLORS = ['#00b386','#6366f1','#f59e0b','#ec4899','#06b6d4']
const COMPARE_TICKERS = ['AAPL','TSLA','NVDA','MSFT','GOOGL']

export function AnalyticsPage() {
  const [trending, setTrending]     = useState<any[]>([])
  const [compareData, setCompare]   = useState<any[]>([])
  const [radarData, setRadar]       = useState<any[]>([])
  const [loading, setLoading]       = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [trendRes, ...histRes] = await Promise.all([
        getTrending(),
        ...COMPARE_TICKERS.map(t => getSentimentHistory(t, 6))
      ])
      setTrending(trendRes.data.slice(0, 10))

      // Build multi-line compare chart
      const maxLen = Math.min(...histRes.map(r => r.data.length))
      const step = Math.floor(maxLen / 20) || 1
      const merged: any[] = []
      for (let i = 0; i < maxLen; i += step) {
        const point: any = { time: `T-${Math.floor((maxLen - i) * 15 / 60)}h` }
        histRes.forEach((r, ci) => {
          point[COMPARE_TICKERS[ci]] = r.data[i]?.score ?? 0
        })
        merged.push(point)
      }
      setCompare(merged)

      // Radar: positive%, vol, momentum for top 5
      const top5 = trendRes.data.slice(0, 5)
      setRadar([
        { metric: 'Pos Score', ...Object.fromEntries(top5.map(t => [t.ticker, Math.max(0, t.score * 100)])) },
        { metric: 'Volume',    ...Object.fromEntries(top5.map(t => [t.ticker, Math.min(100, t.volume / 80)])) },
        { metric: 'Change',    ...Object.fromEntries(top5.map(t => [t.ticker, Math.max(0, t.change_pct * 10)])) },
        { metric: 'Sentiment', ...Object.fromEntries(top5.map(t => [t.ticker, ((t.score + 1) / 2) * 100])) },
        { metric: 'Signals',   ...Object.fromEntries(top5.map(t => [t.ticker, Math.min(100, t.volume / 80)])) },
      ])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const top5 = trending.slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart2 size={20} className="text-brand-500" />
          <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        </div>
        <button onClick={load} className="btn-ghost flex items-center gap-1.5">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={28} /></div>
      ) : (
        <>
          {/* Row 1: Bar chart + Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Sentiment bar chart */}
            <div className="card">
              <p className="text-sm font-semibold text-gray-700 mb-4">Top 10 — Sentiment Score</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={trending} layout="vertical" margin={{ left: 0, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" domain={[-1, 1]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis dataKey="ticker" type="category" tick={{ fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={false} width={52} />
                  <Tooltip formatter={(v: any) => Number(v).toFixed(3)} />
                  <Bar dataKey="score" radius={[0, 6, 6, 0]} maxBarSize={18}>
                    {trending.map((entry, i) => (
                      <Cell key={i} fill={entry.score >= 0 ? '#00b386' : '#e74c3c'} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar chart */}
            <div className="card">
              <p className="text-sm font-semibold text-gray-700 mb-4">Multi-Factor Radar — Top 5</p>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#f0f0f0" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  {top5.map((t, i) => (
                    <Radar key={t.ticker} name={t.ticker} dataKey={t.ticker}
                      stroke={TICKER_COLORS[i]} fill={TICKER_COLORS[i]} fillOpacity={0.12} strokeWidth={2} />
                  ))}
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 2: Multi-ticker comparison line chart */}
          <div className="card">
            <p className="text-sm font-semibold text-gray-700 mb-4">
              6-Hour Sentiment Comparison — {COMPARE_TICKERS.join(', ')}
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={compareData} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <YAxis domain={[-1, 1]} tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false}
                  tickFormatter={(v) => v.toFixed(1)} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10 }}
                  formatter={(v: any, name: string) => [Number(v).toFixed(3), name]} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                {COMPARE_TICKERS.map((t, i) => (
                  <Line key={t} type="monotone" dataKey={t} stroke={TICKER_COLORS[i]}
                    strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Row 3: Leaderboard */}
          <div className="card overflow-hidden p-0">
            <div className="px-5 py-3 border-b border-surface-200 bg-surface-50">
              <h3 className="text-sm font-semibold text-gray-700">Signal Leaderboard</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100">
                  {['Rank','Ticker','Company','Score','Volume','Change'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 px-5 py-3 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trending.map((item, i) => (
                  <tr key={item.ticker} className="border-b border-surface-50 hover:bg-surface-50">
                    <td className="px-5 py-3">
                      <span className={`text-sm font-bold ${i < 3 ? 'text-brand-600' : 'text-gray-400'}`}>
                        #{i + 1}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-bold text-gray-900 text-sm">{item.ticker}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{item.company}</td>
                    <td className="px-5 py-3">
                      <span className={`text-sm font-bold ${item.score >= 0.05 ? 'text-positive' : item.score <= -0.05 ? 'text-negative' : 'text-neutral'}`}>
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
