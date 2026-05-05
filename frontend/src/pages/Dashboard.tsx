import React, { useEffect, useState, useCallback } from 'react'
import {
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts'
import { TrendingUp, TrendingDown, Activity, Zap, Globe, MessageCircle } from 'lucide-react'
import { format } from 'date-fns'
import {
  getSentiment, getSentimentHistory, getPriceHistory,
  getOverview, getSentimentFeed
} from '@/api/client'
import { useStore } from '@/store/useStore'
import { useSocket } from '@/hooks/useSocket'
import {
  SentimentBadge, SentimentGauge, SourceBadge, ScoreBar,
  StatCard, ChangeChip, Spinner, EmptyState
} from '@/components/ui'

const RANGES = [
  { label: '1H', hours: 1 },
  { label: '6H', hours: 6 },
  { label: '1D', hours: 24 },
  { label: '7D', hours: 168 },
]

const COLORS = { positive: '#00b386', negative: '#e74c3c', neutral: '#8c92a0' }

export function Dashboard() {
  const { selectedTicker, setPriceData, setSentimentData, addFeedEvent, feedEvents, prices, sentiments } = useStore()
  const { onPriceUpdate, onSentimentUpdate, subscribeTicker, setLiveConnected } = useSocket() as any
  const { socket } = useSocket()

  const [range, setRange] = useState(RANGES[2])
  const [chartData, setChartData] = useState<any[]>([])
  const [overview, setOverview] = useState<any>(null)
  const [feed, setFeed] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'chart' | 'breakdown'>('chart')

  const price = prices[selectedTicker]
  const sentiment = sentiments[selectedTicker]

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [priceHist, sentHist, sent, feedRes, ov] = await Promise.all([
        getPriceHistory(selectedTicker, range.hours),
        getSentimentHistory(selectedTicker, range.hours),
        getSentiment(selectedTicker),
        getSentimentFeed(selectedTicker, 15),
        getOverview(),
      ])

      setSentimentData(selectedTicker, sent.data)
      setOverview(ov.data)
      setFeed(feedRes.data)

      // Merge price + sentiment into one chart series
      const ph: any[] = priceHist.data
      const sh: any[] = sentHist.data
      const merged = ph.map((p: any, i: number) => ({
        time: format(new Date(p.timestamp), range.hours <= 6 ? 'HH:mm' : 'MMM dd HH:mm'),
        price: p.close,
        sentiment: sh[i]?.score ?? 0,
        volume: p.volume,
      }))
      setChartData(merged)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [selectedTicker, range])

  useEffect(() => { loadData() }, [loadData])

  // Live socket
  useEffect(() => {
    subscribeTicker(selectedTicker)
    const offPrice = onPriceUpdate((data: any) => {
      if (data.ticker === selectedTicker) setPriceData(selectedTicker, data)
    })
    const offSent = onSentimentUpdate((data: any) => {
      if (data.ticker === selectedTicker) {
        addFeedEvent(data)
        setFeed(prev => [data, ...prev].slice(0, 15))
      }
    })
    socket.on('connect', () => useStore.getState().setLiveConnected(true))
    socket.on('disconnect', () => useStore.getState().setLiveConnected(false))
    return () => { offPrice(); offSent() }
  }, [selectedTicker])

  const pieData = sentiment ? [
    { name: 'Positive', value: sentiment.positive_pct, color: COLORS.positive },
    { name: 'Negative', value: sentiment.negative_pct, color: COLORS.negative },
    { name: 'Neutral',  value: sentiment.neutral_pct,  color: COLORS.neutral  },
  ] : []

  const sourceData = sentiment ? [
    { name: 'News',    value: sentiment.source_breakdown.news },
    { name: 'Twitter', value: sentiment.source_breakdown.twitter },
    { name: 'Reddit',  value: sentiment.source_breakdown.reddit },
  ] : []

  return (
    <div className="flex flex-col gap-5 p-6 min-h-0 overflow-y-auto">

      {/* Overview stats row */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Signals Today" value={overview.total_signals_today.toLocaleString()}
            icon={<Activity size={18} />} />
          <StatCard label="Market Mood" value={overview.market_mood}
            icon={<Globe size={18} />} />
          <StatCard label="Most Bullish" value={overview.most_bullish}
            sub={<span className="text-xs text-positive font-semibold">↑ Strong Buy</span>}
            icon={<TrendingUp size={18} />} />
          <StatCard label="Most Bearish" value={overview.most_bearish}
            sub={<span className="text-xs text-negative font-semibold">↓ Caution</span>}
            icon={<TrendingDown size={18} />} />
        </div>
      )}

      {/* Main ticker panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: chart */}
        <div className="lg:col-span-2 card">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">{selectedTicker}</h2>
                {sentiment && <SentimentBadge label={sentiment.label} />}
              </div>
              {price && (
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold text-gray-900">₹{price.close.toFixed(2)}</span>
                  <ChangeChip value={price.change_pct} />
                </div>
              )}
            </div>
            {/* Range selector */}
            <div className="flex gap-1 bg-surface-100 rounded-xl p-1">
              {RANGES.map(r => (
                <button key={r.label} onClick={() => setRange(r)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    range.label === r.label
                      ? 'bg-white text-brand-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mb-4 border-b border-surface-200">
            <button onClick={() => setActiveTab('chart')}
              className={`pb-2 text-sm transition-colors ${activeTab === 'chart' ? 'tab-active' : 'tab-inactive'}`}>
              Price & Sentiment
            </button>
            <button onClick={() => setActiveTab('breakdown')}
              className={`pb-2 text-sm transition-colors ${activeTab === 'breakdown' ? 'tab-active' : 'tab-inactive'}`}>
              Breakdown
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64"><Spinner size={28} /></div>
          ) : activeTab === 'chart' ? (
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00b386" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#00b386" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false}
                  interval={Math.floor(chartData.length / 6)} />
                <YAxis yAxisId="price" orientation="left" tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickLine={false} axisLine={false} domain={['auto', 'auto']}
                  tickFormatter={(v) => `₹${v.toFixed(0)}`} />
                <YAxis yAxisId="sent" orientation="right" tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickLine={false} axisLine={false} domain={[-1, 1]}
                  tickFormatter={(v) => v.toFixed(1)} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 12 }}
                  formatter={(val: any, name: string) => [
                    name === 'price' ? `₹${Number(val).toFixed(2)}` : Number(val).toFixed(4),
                    name === 'price' ? 'Price' : 'Sentiment'
                  ]} />
                <ReferenceLine yAxisId="sent" y={0} stroke="#e5e7eb" strokeDasharray="4 4" />
                <Area yAxisId="price" type="monotone" dataKey="price" stroke="#00b386" strokeWidth={2}
                  fill="url(#priceGrad)" dot={false} />
                <Line yAxisId="sent" type="monotone" dataKey="sentiment" stroke="#6366f1" strokeWidth={1.5}
                  dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid grid-cols-2 gap-4 h-64">
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Sentiment Split</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                      dataKey="value" paddingAngle={3}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => `${v}%`} />
                    <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Source Breakdown</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={sourceData} layout="vertical" margin={{ left: 0, right: 8 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={50} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#00b386" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Right: gauge + feed */}
        <div className="flex flex-col gap-4">
          {/* Gauge */}
          <div className="card flex flex-col items-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Sentiment Score</p>
            <SentimentGauge score={sentiment?.score ?? 0} />
            {sentiment && (
              <div className="w-full mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-gray-400">Positive</p>
                  <p className="text-sm font-bold text-positive">{sentiment.positive_pct}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Neutral</p>
                  <p className="text-sm font-bold text-neutral">{sentiment.neutral_pct}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Negative</p>
                  <p className="text-sm font-bold text-negative">{sentiment.negative_pct}%</p>
                </div>
              </div>
            )}
          </div>

          {/* Momentum */}
          {sentiment && (
            <div className="card">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Momentum</p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Score</span>
                    <span className="font-semibold">{sentiment.score > 0 ? '+' : ''}{sentiment.score.toFixed(3)}</span>
                  </div>
                  <ScoreBar score={sentiment.score} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Momentum</span>
                  <ChangeChip value={sentiment.momentum * 100} suffix="" />
                </div>
              </div>
            </div>
          )}

          {/* Live feed */}
          <div className="card flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Live Feed</p>
              <span className="text-xs text-brand-500 font-medium flex items-center gap-1">
                <span className="pulse-dot" /> Live
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {feed.length === 0
                ? <EmptyState icon={<MessageCircle size={28} />} message="No signals yet" />
                : feed.map((e, i) => (
                  <div key={e.id ?? i} className="fade-up border-b border-surface-100 pb-2 last:border-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <SourceBadge source={e.source} />
                      <SentimentBadge label={e.sentiment_label} score={e.sentiment_score} />
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{e.raw_text}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {e.timestamp ? format(new Date(e.timestamp), 'HH:mm:ss') : ''}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
