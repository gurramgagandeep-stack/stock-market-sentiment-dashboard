import React from 'react'
import { TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react'
import clsx from 'clsx'

// ── SentimentBadge ────────────────────────────────────────────────────────────
export function SentimentBadge({ label, score }: { label: string; score?: number }) {
  const cls = label === 'positive' ? 'badge-positive' : label === 'negative' ? 'badge-negative' : 'badge-neutral'
  const Icon = label === 'positive' ? TrendingUp : label === 'negative' ? TrendingDown : Minus
  return (
    <span className={cls}>
      <Icon size={11} />
      {label.charAt(0).toUpperCase() + label.slice(1)}
      {score !== undefined && <span className="ml-0.5 opacity-70">{score > 0 ? '+' : ''}{score.toFixed(2)}</span>}
    </span>
  )
}

// ── SourceBadge ───────────────────────────────────────────────────────────────
export function SourceBadge({ source }: { source: string }) {
  const cls = source === 'news' ? 'badge-news' : source === 'twitter' ? 'badge-twitter' : 'badge-reddit'
  const label = source === 'twitter' ? 'Twitter' : source === 'reddit' ? 'Reddit' : 'News'
  return <span className={cls}>{label}</span>
}

// ── ScoreBar ──────────────────────────────────────────────────────────────────
export function ScoreBar({ score }: { score: number }) {
  const pct = ((score + 1) / 2) * 100
  const color = score >= 0.05 ? 'bg-positive' : score <= -0.05 ? 'bg-negative' : 'bg-neutral'
  return (
    <div className="w-full h-1.5 bg-surface-200 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin text-brand-500" />
}

// ── ChangeChip ────────────────────────────────────────────────────────────────
export function ChangeChip({ value, suffix = '%' }: { value: number; suffix?: string }) {
  const pos = value >= 0
  return (
    <span className={clsx('inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md',
      pos ? 'bg-green-50 text-positive' : 'bg-red-50 text-negative')}>
      {pos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {pos ? '+' : ''}{value.toFixed(2)}{suffix}
    </span>
  )
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon }: { label: string; value: string; sub?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="card flex items-start gap-4">
      {icon && <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 flex-shrink-0">{icon}</div>}
      <div className="min-w-0">
        <p className="stat-label">{label}</p>
        <p className="stat-value mt-0.5">{value}</p>
        {sub && <div className="mt-1">{sub}</div>}
      </div>
    </div>
  )
}

// ── SentimentGauge ────────────────────────────────────────────────────────────
export function SentimentGauge({ score }: { score: number }) {
  const angle = (score + 1) / 2 * 180 - 90
  const color = score >= 0.05 ? '#00b386' : score <= -0.05 ? '#e74c3c' : '#8c92a0'
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 70" width="140" height="82">
        {/* Background arc */}
        <path d="M10 65 A50 50 0 0 1 110 65" fill="none" stroke="#f0f0f0" strokeWidth="10" strokeLinecap="round"/>
        {/* Negative zone */}
        <path d="M10 65 A50 50 0 0 1 35 22" fill="none" stroke="#fde8e8" strokeWidth="10" strokeLinecap="round"/>
        {/* Positive zone */}
        <path d="M85 22 A50 50 0 0 1 110 65" fill="none" stroke="#e6f9f4" strokeWidth="10" strokeLinecap="round"/>
        {/* Needle */}
        <g transform={`rotate(${angle}, 60, 65)`}>
          <line x1="60" y1="65" x2="60" y2="22" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="60" cy="65" r="4" fill={color}/>
        </g>
        {/* Labels */}
        <text x="8" y="72" fontSize="7" fill="#e74c3c" fontWeight="600">−1</text>
        <text x="54" y="16" fontSize="7" fill="#8c92a0" fontWeight="600">0</text>
        <text x="104" y="72" fontSize="7" fill="#00b386" fontWeight="600">+1</text>
      </svg>
      <div className="mt-1 text-center">
        <span className="text-2xl font-bold" style={{ color }}>{score > 0 ? '+' : ''}{score.toFixed(3)}</span>
      </div>
    </div>
  )
}

// ── LiveDot ───────────────────────────────────────────────────────────────────
export function LiveDot({ connected }: { connected: boolean }) {
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
      <span className={clsx('w-1.5 h-1.5 rounded-full', connected ? 'bg-brand-500 pulse-dot' : 'bg-gray-300')} />
      {connected ? 'LIVE' : 'Connecting...'}
    </span>
  )
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
      <div className="opacity-40">{icon}</div>
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}
