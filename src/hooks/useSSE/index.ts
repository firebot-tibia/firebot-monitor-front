import { useState, useEffect, useCallback, useRef } from 'react'

import { signOut, useSession } from 'next-auth/react'

import { Logger } from '@/middlewares/useLogger'
import { SSEClient } from '@/services/sse'
import type { UseSSEOptions, ConnectionStatus } from '@/services/sse/types'
import { useTokenStore } from '@/stores/token-decoded-store'

export const useSSE = ({ endpoint, onMessage, onError }: UseSSEOptions) => {
  const { data: session } = useSession()
  const { selectedWorld, decodeAndSetToken } = useTokenStore()
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const sseClientRef = useRef<SSEClient | null>(null)
  const logger = Logger.getInstance()

  const handleTokenRefresh = useCallback(
    (newToken: string) => {
      decodeAndSetToken(newToken)
    },
    [decodeAndSetToken],
  )

  const handleMaxRetriesReached = useCallback(async () => {
    logger.warn('Max SSE reconnection attempts reached, signing out')
    await signOut({
      callbackUrl: '/',
      redirect: true,
    })
  }, [logger])

  const cleanupSSE = useCallback(() => {
    if (sseClientRef.current) {
      sseClientRef.current.closeConnection()
      sseClientRef.current = null
    }
  }, [])

  useEffect(() => {
    const initializeSSE = async () => {
      if (!session?.access_token || !session?.refresh_token || !selectedWorld) {
        cleanupSSE()
        return
      }

      try {
        const fullUrl = `${endpoint}${endpoint.includes('?') ? '&' : '?'}token=${encodeURIComponent(
          session.access_token,
        )}&world=${selectedWorld}`

        sseClientRef.current = new SSEClient({
          url: fullUrl,
          token: session.access_token,
          refreshToken: session.refresh_token,
          onMessage,
          onError,
          onTokenRefresh: handleTokenRefresh,
          onStatusChange: setStatus,
          onMaxRetriesReached: handleMaxRetriesReached,
        })

        sseClientRef.current.connect()
      } catch (error) {
        logger.error('Error initializing SSE connection', error)
        onError?.(error instanceof Error ? error : new Error('Failed to initialize SSE'))
      }
    }

    initializeSSE()

    return cleanupSSE
  }, [
    endpoint,
    session?.access_token,
    session?.refresh_token,
    selectedWorld,
    onMessage,
    onError,
    handleTokenRefresh,
    handleMaxRetriesReached,
    cleanupSSE,
    logger,
  ])

  const reconnect = useCallback(() => {
    cleanupSSE()
    sseClientRef.current?.connect()
  }, [cleanupSSE])

  return {
    status,
    isConnected: status === 'connected',
    reconnect,
  }
}
