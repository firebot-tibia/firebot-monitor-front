import { useCallback, useEffect, useRef, useState } from 'react'

import { useSession } from 'next-auth/react'

import { SSEClient } from '@/core/sse/services'
import type { ConnectionStatus, SSEConfig, SSEMessage } from '@/core/sse/services/types'
import { useTokenStore } from '@/modules/auth/store/token-decoded-store'

interface UseSSEProps {
  endpoint: string
  onMessage: (data: any) => void
  onError?: (error: Error) => void
}

export const useSSE = ({ endpoint, onMessage, onError }: UseSSEProps) => {
  const { data: session } = useSession()
  const { selectedWorld } = useTokenStore()
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const sseClientRef = useRef<SSEClient | null>(null)
  const isConnected = status === 'connected'

  const handleTokenRefresh = useCallback((newToken: string) => {
    console.log('Token refreshed:', newToken)
  }, [])

  const handleMaxRetriesReached = useCallback(async () => {
    console.log('Max retries reached')
    setStatus('disconnected')
  }, [])

  const cleanupSSE = useCallback(() => {
    if (sseClientRef.current) {
      sseClientRef.current.closeConnection()
      sseClientRef.current = null
    }
    setStatus('disconnected')
  }, [])

  const initializeSSE = useCallback(() => {
    if (!session?.access_token || !session?.refresh_token || !selectedWorld) return

    const config: SSEConfig = {
      url: endpoint,
      token: session.access_token,
      refreshToken: session.refresh_token,
      worldId: selectedWorld,
      onMessage: (message: SSEMessage) => {
        try {
          if (typeof message.data === 'string') {
            const data = JSON.parse(message.data)
            onMessage(data)
          } else {
            onMessage(message.data)
          }
        } catch (error) {
          console.error('Failed to parse SSE message:', error)
          onError?.(error instanceof Error ? error : new Error('Failed to parse SSE message'))
        }
      },
      onError: error => {
        console.error('SSE Error:', error)
        onError?.(error)
        setStatus('disconnected')
      },
      onTokenRefresh: handleTokenRefresh,
      onStatusChange: newStatus => setStatus(newStatus),
      onMaxRetriesReached: handleMaxRetriesReached,
    }

    sseClientRef.current = new SSEClient(config)
    sseClientRef.current.connect()

    return cleanupSSE
  }, [
    endpoint,
    onMessage,
    onError,
    session,
    selectedWorld,
    handleTokenRefresh,
    handleMaxRetriesReached,
    cleanupSSE,
  ])

  useEffect(() => {
    const cleanup = initializeSSE()
    return () => {
      cleanup?.()
    }
  }, [initializeSSE])

  const reconnect = useCallback(() => {
    cleanupSSE()
    initializeSSE()
  }, [cleanupSSE, initializeSSE])

  return {
    status,
    isConnected,
    reconnect,
  }
}

export default useSSE
