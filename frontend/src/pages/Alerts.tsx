import React, { useEffect, useState } from 'react'
import { Bell, CheckCheck, TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'
import { getAlerts, acknowledgeAlert as ackApi } from '@/api/client'
import { useStore } from '@/store/useStore'
import { Spinner } from '@/components/ui'
import clsx from 'clsx'

export function AlertsPage() {
  const { alerts, setAlerts, acknowledgeAlert } = useStore()
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'positive' | 'negative'>('all')

  useEffect(() => {
    getAlerts()
      .then(r => setAlerts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleAck = async (id: string) => {
    try {
      await ackApi(id)
      acknowledgeAlert(id)
    } catch {}
  }

  const handleAckAll = async () => {
    const unread = alerts.filter(a => !a.acknowledged)
    await Promise.all(unread.map(a => ackApi(a.id).catch(() => {})))
    unread.forEach(a => acknowledgeAlert(a.id))
  }

  const filtered = alerts.filter(a => {
    if (filter === 'unread')   return !a.acknowledged
    if (filter === 'positive') return a.type === 'positive'
    if (filter === 'negative') return a.type === 'negative'
    return true
  })

  const unreadCount = alerts.filter(a => !a.acknowledged).length

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell size={20} className="text-brand-500" />
          <h1 className="text-xl font-bold text-gray-900">Alerts</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleAckAll} className="btn-ghost flex items-center gap-1.5 text-brand-600">
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-surface-100 rounded-xl p-1 mb-5 w-fit">
        {(['all', 'unread', 'positive', 'negative'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={clsx('px-4 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors',
              filter === f ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={28} /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <Bell size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No alerts to show.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(alert => (
            <div key={alert.id}
              className={clsx('card flex items-start gap-4 transition-all',
                !alert.acknowledged ? 'border-l-4' : 'opacity-70',
                alert.type === 'positive' ? 'border-l-positive' : 'border-l-negative')}>

              {/* Icon */}
              <div className={clsx('p-2.5 rounded-xl flex-shrink-0',
                alert.type === 'positive' ? 'bg-green-50' : 'bg-red-50')}>
                {alert.type === 'positive'
                  ? <TrendingUp size={18} className="text-positive" />
                  : <TrendingDown size={18} className="text-negative" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-gray-900">{alert.ticker}</span>
                      {!alert.acknowledged && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {alert.timestamp ? format(new Date(alert.timestamp), 'MMM dd, yyyy  HH:mm:ss') : ''}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={clsx('text-lg font-bold',
                      alert.score >= 0.05 ? 'text-positive' : alert.score <= -0.05 ? 'text-negative' : 'text-neutral')}>
                      {alert.score > 0 ? '+' : ''}{alert.score.toFixed(3)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ack button */}
              {!alert.acknowledged && (
                <button onClick={() => handleAck(alert.id)}
                  className="flex-shrink-0 p-2 rounded-xl hover:bg-surface-100 text-gray-400 hover:text-brand-600 transition-colors"
                  title="Mark as read">
                  <CheckCheck size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
