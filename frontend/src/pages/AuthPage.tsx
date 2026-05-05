import React, { useState, useEffect } from 'react'
import { TrendingUp, Eye, EyeOff, ArrowRight, CheckCircle2, User, Mail, Lock } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { PinInput } from '@/components/ui/PinInput'
import clsx from 'clsx'

type Mode = 'login' | 'register'

export function AuthPage() {
  const { login, register, _loadFromStorage } = useAuthStore()
  const [mode, setMode] = useState<Mode>('login')

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPin, setLoginPin]     = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Register state
  const [regName, setRegName]   = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPin, setRegPin]     = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [regError, setRegError] = useState('')
  const [regSuccess, setRegSuccess] = useState(false)
  const [regLoading, setRegLoading] = useState(false)
  const [showHint, setShowHint]  = useState(false)

  useEffect(() => { _loadFromStorage() }, [])

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    if (!loginEmail.trim()) { setLoginError('Please enter your email.'); return }
    if (loginPin.length < 4) { setLoginError('Enter your 4-digit PIN.'); return }
    setLoginLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const res = login(loginEmail.trim(), loginPin)
    setLoginLoading(false)
    if (!res.success) { setLoginError(res.message); setLoginPin('') }
  }

  // ── Register ───────────────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegError('')
    if (!regName.trim())  { setRegError('Please enter your full name.'); return }
    if (!regEmail.trim()) { setRegError('Please enter your email.'); return }
    if (!/\S+@\S+\.\S+/.test(regEmail)) { setRegError('Please enter a valid email.'); return }
    if (regPin.length < 4) { setRegError('Please set a 4-digit PIN.'); return }
    if (regPin !== regConfirm) { setRegError('PINs do not match.'); return }
    setRegLoading(true)
    await new Promise(r => setTimeout(r, 700))
    const res = register(regName.trim(), regEmail.trim(), regPin)
    setRegLoading(false)
    if (!res.success) { setRegError(res.message) }
    else { setRegSuccess(true) }
  }

  const switchMode = (m: Mode) => {
    setMode(m)
    setLoginError(''); setLoginPin(''); setLoginEmail('')
    setRegError(''); setRegPin(''); setRegConfirm(''); setRegName(''); setRegEmail('')
    setRegSuccess(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-green-50 flex items-center justify-center p-4">

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-green-100 rounded-full opacity-40 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center shadow-glow mb-4">
            <TrendingUp size={28} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SentimentIQ</h1>
          <p className="text-sm text-gray-500 mt-1">Real-Time Market Intelligence</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-elevated border border-surface-200 overflow-hidden">

          {/* Tab switcher */}
          <div className="flex border-b border-surface-200">
            {(['login', 'register'] as Mode[]).map(m => (
              <button key={m} onClick={() => switchMode(m)}
                className={clsx(
                  'flex-1 py-4 text-sm font-semibold capitalize transition-colors',
                  mode === m
                    ? 'text-brand-600 border-b-2 border-brand-500 bg-brand-50/40'
                    : 'text-gray-400 hover:text-gray-600'
                )}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="p-8">

            {/* ── LOGIN FORM ─────────────────────────────────────────────────── */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <p className="text-xl font-bold text-gray-900">Welcome back</p>
                  <p className="text-sm text-gray-500 mt-1">Enter your email and 4-digit PIN</p>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={e => { setLoginEmail(e.target.value); setLoginError('') }}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent
                                 placeholder:text-gray-300 bg-surface-50"
                    />
                  </div>
                </div>

                {/* PIN */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    4-Digit PIN
                  </label>
                  <PinInput
                    value={loginPin}
                    onChange={v => { setLoginPin(v); setLoginError('') }}
                    error={!!loginError}
                    disabled={loginLoading}
                  />
                </div>

                {/* Error */}
                {loginError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 text-center fade-up">
                    {loginError}
                  </div>
                )}

                {/* Submit */}
                <button type="submit" disabled={loginLoading || loginPin.length < 4}
                  className={clsx(
                    'w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 flex items-center justify-center gap-2',
                    loginLoading || loginPin.length < 4
                      ? 'bg-brand-300 cursor-not-allowed'
                      : 'bg-brand-500 hover:bg-brand-600 active:scale-[0.98] shadow-md hover:shadow-glow'
                  )}>
                  {loginLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in…
                    </span>
                  ) : (
                    <>Sign In <ArrowRight size={16} /></>
                  )}
                </button>

                <p className="text-center text-xs text-gray-400">
                  New to SentimentIQ?{' '}
                  <button type="button" onClick={() => switchMode('register')}
                    className="text-brand-600 font-semibold hover:underline">
                    Create an account
                  </button>
                </p>
              </form>
            )}

            {/* ── REGISTER FORM ──────────────────────────────────────────────── */}
            {mode === 'register' && !regSuccess && (
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <p className="text-xl font-bold text-gray-900">Create account</p>
                  <p className="text-sm text-gray-500 mt-1">Set up your PIN to secure your dashboard</p>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Full Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Ravi Kumar"
                      value={regName}
                      onChange={e => { setRegName(e.target.value); setRegError('') }}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent
                                 placeholder:text-gray-300 bg-surface-50"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={regEmail}
                      onChange={e => { setRegEmail(e.target.value); setRegError('') }}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent
                                 placeholder:text-gray-300 bg-surface-50"
                    />
                  </div>
                </div>

                {/* Set PIN */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Set PIN</label>
                    <button type="button" onClick={() => setShowHint(!showHint)}
                      className="text-xs text-brand-500 hover:underline flex items-center gap-1">
                      <Lock size={11} /> Choose a PIN you'll remember
                    </button>
                  </div>
                  <PinInput
                    value={regPin}
                    onChange={v => { setRegPin(v); setRegError('') }}
                    error={!!regError && regError.includes('PIN')}
                    disabled={regLoading}
                  />
                </div>

                {/* Confirm PIN */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Confirm PIN</label>
                  <PinInput
                    value={regConfirm}
                    onChange={v => { setRegConfirm(v); setRegError('') }}
                    error={!!regError && regError.includes('match')}
                    disabled={regLoading}
                  />
                  {regPin.length === 4 && regConfirm.length === 4 && regPin === regConfirm && (
                    <p className="text-xs text-positive flex items-center justify-center gap-1 fade-up">
                      <CheckCircle2 size={13} /> PINs match
                    </p>
                  )}
                </div>

                {/* Error */}
                {regError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 text-center fade-up">
                    {regError}
                  </div>
                )}

                {/* Submit */}
                <button type="submit"
                  disabled={regLoading || regPin.length < 4 || regConfirm.length < 4}
                  className={clsx(
                    'w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 flex items-center justify-center gap-2',
                    regLoading || regPin.length < 4 || regConfirm.length < 4
                      ? 'bg-brand-300 cursor-not-allowed'
                      : 'bg-brand-500 hover:bg-brand-600 active:scale-[0.98] shadow-md hover:shadow-glow'
                  )}>
                  {regLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating account…
                    </span>
                  ) : (
                    <>Create Account <ArrowRight size={16} /></>
                  )}
                </button>

                <p className="text-center text-xs text-gray-400">
                  Already have an account?{' '}
                  <button type="button" onClick={() => switchMode('login')}
                    className="text-brand-600 font-semibold hover:underline">
                    Sign in
                  </button>
                </p>
              </form>
            )}

            {/* ── SUCCESS STATE ──────────────────────────────────────────────── */}
            {mode === 'register' && regSuccess && (
              <div className="text-center space-y-4 py-4 fade-up">
                <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} className="text-brand-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">You're all set!</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Welcome, <span className="font-semibold text-brand-600">{regName}</span>.
                    Your account is ready.
                  </p>
                </div>
                <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 text-sm text-brand-700">
                  Redirecting to your dashboard…
                  <span className="block w-full h-1 bg-brand-200 rounded-full mt-2 overflow-hidden">
                    <span className="block h-full bg-brand-500 rounded-full animate-[progress_1.5s_ease-in-out_forwards]" />
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Your PIN is stored locally on this device only.
        </p>
      </div>
    </div>
  )
}
