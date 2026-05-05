import React, { useRef, useState, useEffect } from 'react'
import clsx from 'clsx'

interface PinInputProps {
  value: string
  onChange: (val: string) => void
  error?: boolean
  disabled?: boolean
}

export function PinInput({ value, onChange, error, disabled }: PinInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const arr = value.split('')
      if (arr[i]) {
        arr[i] = ''
        onChange(arr.join(''))
      } else if (i > 0) {
        arr[i - 1] = ''
        onChange(arr.join(''))
        inputs.current[i - 1]?.focus()
      }
    }
  }

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const ch = e.target.value.replace(/\D/g, '').slice(-1)
    if (!ch) return
    const arr = value.padEnd(4, ' ').split('')
    arr[i] = ch
    const next = arr.join('').replace(/ /g, '')
    onChange(next)
    if (i < 3) inputs.current[i + 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (pasted) { onChange(pasted); inputs.current[Math.min(pasted.length, 3)]?.focus() }
    e.preventDefault()
  }

  useEffect(() => {
    if (value === '') inputs.current[0]?.focus()
  }, [value])

  return (
    <div className="flex gap-3 justify-center">
      {[0, 1, 2, 3].map(i => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el }}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          onClick={() => inputs.current[i]?.select()}
          className={clsx(
            'w-14 h-14 text-center text-2xl font-bold rounded-2xl border-2 outline-none transition-all duration-150',
            'focus:border-brand-500 focus:shadow-glow',
            error
              ? 'border-red-400 bg-red-50 text-red-600 shake'
              : value[i]
                ? 'border-brand-400 bg-brand-50 text-brand-700'
                : 'border-surface-300 bg-surface-50 text-gray-800',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
      ))}
    </div>
  )
}
