import React, { useEffect, useState } from 'react'
import { Activity, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { useSocket } from '@/hooks/useSocket'
import { useStore } from '@/store/useStore'
import { getSentimentFeed } from '@/api/client'
import { SentimentBadge, SourceBadge, ScoreBar, Spinner } from '@/components/ui'
import clsx from 'clsx'

const SOURCES = ['all', 'twitter', 'reddit', 'news']
const LABELS  = ['all', 'positive', 'neutral', 'negative']

export function LiveFeedPage() {
  const { feedEvents, addFeedEvent } = useStore()
  const { onSentimentUpdate } = useSocket()
  const [initial, setInitial]   = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [source, setSource]     = useState('all')
  const [label, setLabel]       = useState('all')
  const [ticker, setTicker]     = useState('')

  useEffect(() => {
    getSentimentFeed('AAPL', 30)
      .then(r => setInitial(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const off = onSentimentUpdate((data: any) => addFeedEvent(data))
    return () => { off() }
  }, [])

  const all = [...feedEvents, ...initial]

  const filtered = all.filter(e => {
    if (source !== 'all' && e.source !== source) return false
    if (label  !== 'all' && e.sentiment_label !== label) return false
    if (ticker && !e.ticker?.toUpperCase().includes(ticker.toUpperCase())) return false
    return true
  })

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Activity size={20} className="text-brand-500" />
        <h1 className="text-xl font-bold text-gray-900">Live Sentiment Feed</h1>
        <span className="flex items-center gap-1.5 text-xs font-medium text-brand-600 ml-2">
          <span className="pulse-dot" /> Streaming
        </span>
      </div>

      {/* Filters */}
      <div className="card mb-5 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filters</span>
        </div>

        {/* Ticker search */}
        <input type="text" placeholder="Ticker…" value={ticker}
          onChange={e => setTicker(e.target.value.toUpperCase())}
          className="px-3 py-1.5 text-sm border border-surface-200 rounded-xl w-28
                     focus:outline-none focus:ring-2 focus:ring-brand-400" />

        {/* Source pills */}
        <div className="flex gap-1 bg-surface-100 rounded-xl p-1">
          {SOURCES.map(s => (
            <button key={s} onClick={() => setSource(s)}
              className={clsx('px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors',
                source === s ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              {s}
            </button>
          ))}
        </div>

        {/* Label pills */}
        <div className="flex gap-1 bg-surface-100 rounded-xl p-1">
          {LABELS.map(l => (
            <button key={l} onClick={() => setLabel(l)}
              className={clsx('px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors',
                label === l ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              {l}
            </button>
          ))}
        </div>

        <span className="ml-auto text-xs text-gray-400">{filtered.length} signals</span>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={28} /></div>
      ) : (
        <div className="space-y-3">
          {filtered.slice(0, 60).map((e, i) => (
            <div key={e.id ?? i} className="card fade-up hover:border-brand-200 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-lg">
                      {e.ticker}
                    </span>
                    <SourceBadge source={e.source} />
                    <SentimentBadge label={e.sentiment_label} score={e.sentiment_score} />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{e.raw_text}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">
                    {e.timestamp ? format(new Date(e.timestamp), 'HH:mm:ss') : ''}
                  </p>
                  <div className="mt-2 w-24">
                    <ScoreBar score={e.sentiment_score} />
                  </div>
                  <p className="text-xs font-semibold mt-1"
                    style={{ color: e.sentiment_score >= 0.05 ? '#00b386' : e.sentiment_score <= -0.05 ? '#e74c3c' : '#8c92a0' }}>
                    {e.sentiment_score > 0 ? '+' : ''}{e.sentiment_score.toFixed(3)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400 text-sm">
              No signals match your filters.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

