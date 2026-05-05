/// <reference types="vite/client" />
import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8000'
let globalSocket: Socket | null = null

function getSocket(): Socket {
  if (!globalSocket) {
    globalSocket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    })
  }
  return globalSocket
}

export function useSocket() {
  const socket = getSocket()

  const subscribeTicker = useCallback((ticker: string) => {
    socket.emit('subscribe_ticker', { ticker })
  }, [socket])

  const unsubscribeTicker = useCallback((ticker: string) => {
    socket.emit('unsubscribe_ticker', { ticker })
  }, [socket])

  const onPriceUpdate = useCallback((cb: (data: any) => void) => {
    socket.on('price_update', cb)
    return () => socket.off('price_update', cb)
  }, [socket])

  const onSentimentUpdate = useCallback((cb: (data: any) => void) => {
    socket.on('sentiment_update', cb)
    return () => socket.off('sentiment_update', cb)
  }, [socket])

  const onAggregateUpdate = useCallback((cb: (data: any) => void) => {
    socket.on('aggregate_update', cb)
    return () => socket.off('aggregate_update', cb)
  }, [socket])

  return { socket, subscribeTicker, unsubscribeTicker, onPriceUpdate, onSentimentUpdate, onAggregateUpdate }
}

