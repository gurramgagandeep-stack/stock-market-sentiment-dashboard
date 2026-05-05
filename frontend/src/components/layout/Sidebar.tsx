import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, Bell, Star, Activity, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '@/store/useStore'
import clsx from 'clsx'

const NAV = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/watchlist', icon: Star,            label: 'Watchlist' },
  { to: '/trending',  icon: TrendingUp,      label: 'Trending' },
  { to: '/feed',      icon: Activity,        label: 'Live Feed' },
  { to: '/alerts',    icon: Bell,            label: 'Alerts' },
  { to: '/analytics', icon: BarChart2,       label: 'Analytics' },
]

export function Sidebar() {
  const { sidebarOpen, toggleSidebar, alerts } = useStore()
  const unread = alerts.filter(a => !a.acknowledged).length

  return (
    <aside className={clsx(
      'relative flex flex-col bg-white border-r border-surface-200 transition-all duration-300 flex-shrink-0',
      sidebarOpen ? 'w-56' : 'w-16'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-surface-200 min-h-[64px]">
        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <TrendingUp size={16} className="text-white" strokeWidth={2.5} />
        </div>
        {sidebarOpen && (
          <div>
            <p className="font-bold text-gray-900 leading-none text-sm">SentimentIQ</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Market Intelligence</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) =>
            clsx('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:bg-surface-100 hover:text-gray-800')
          }>
            {({ isActive }) => (
              <>
                <div className="relative flex-shrink-0">
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {label === 'Alerts' && unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-white text-[8px] flex items-center justify-center font-bold">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </div>
                {sidebarOpen && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-surface-200 rounded-full flex items-center justify-center shadow-sm hover:border-brand-300 hover:text-brand-600 transition-colors z-10">
        {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>

      {/* Bottom version */}
      {sidebarOpen && (
        <div className="px-4 py-3 border-t border-surface-200">
          <p className="text-[10px] text-gray-400">v1.0.0 — Demo Mode</p>
        </div>
      )}
    </aside>
  )
}
