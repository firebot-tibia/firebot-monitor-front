import { useCallback, useEffect, useRef, useState } from 'react'

import { useSession } from 'next-auth/react'

import { SSEClient } from '@/core/sse/services'
import type { ConnectionStatus, SSEConfig, SSEMessage } from '@/core/sse/services/types'
import { useTokenStore } from '@/modules/auth/store/token-decoded-store'

interface UseSSEProps {
  endpoint: string
  onMessage: (data: any) => void
  onError?: (error: Error) => void
  reconnectOnError?: boolean
  reconnectInterval?: number
  bufferSize?: number // Added parameter
  throttle?: number // Added parameter
}

export const useSSE = ({
  endpoint,
  onMessage,
  onError,
  reconnectOnError = true,
  reconnectInterval = 1000,
  bufferSize = 0, // Default: disable buffering
  throttle = 100, // Default: fast updates
}: UseSSEProps) => {
  const { data: session } = useSession()
  const { selectedWorld } = useTokenStore()
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const sseClientRef = useRef<SSEClient | null>(null)
  const lastMessageRef = useRef<string>('') // Cache last message to prevent duplicates
  const isConnected = status === 'connected'

  // Debounced message handler to prevent excessive updates
  const handleMessageDebounced = useCallback(
    (message: SSEMessage) => {
      try {
        if (typeof message.data === 'string') {
          // Skip duplicate messages
          if (message.data === lastMessageRef.current) return
          lastMessageRef.current = message.data

          const data = JSON.parse(message.data)
          // Use requestAnimationFrame to batch with browser render cycle
          requestAnimationFrame(() => {
            onMessage(data)
          })
        } else {
          if (JSON.stringify(message.data) === lastMessageRef.current) return
          lastMessageRef.current = JSON.stringify(message.data)

          requestAnimationFrame(() => {
            onMessage(message.data)
          })
        }
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error('Failed to parse SSE message'))
      }
    },
    [onMessage, onError],
  )

  const handleTokenRefresh = useCallback((newToken: string) => {}, [])

  const handleMaxRetriesReached = useCallback(async () => {
    setStatus('disconnected')

    if (reconnectOnError) {
      // Use setTimeout to avoid immediate reconnection
      setTimeout(() => {
        cleanupSSE()
        initializeSSE()
      }, reconnectInterval)
    }
  }, [reconnectOnError, reconnectInterval])

  const cleanupSSE = useCallback(() => {
    if (sseClientRef.current) {
      sseClientRef.current.closeConnection()
      sseClientRef.current = null
      setStatus('disconnected')
    }
  }, [])

  const initializeSSE = useCallback(() => {
    if (!session?.access_token || !session?.refresh_token || !selectedWorld || sseClientRef.current)
      return

    // Add performance parameters to URL
    const url = new URL(endpoint)
    url.searchParams.set('buffer_size', bufferSize.toString())
    url.searchParams.set('throttle', throttle.toString())

    const config: SSEConfig = {
      url: url.toString(),
      token: session.access_token,
      refreshToken: session.refresh_token,
      worldId: selectedWorld,
      onMessage: handleMessageDebounced,
      onError: error => {
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
    bufferSize,
    throttle,
    handleMessageDebounced,
    onError,
    session,
    selectedWorld,
    handleTokenRefresh,
    handleMaxRetriesReached,
    cleanupSSE,
  ])

  useEffect(() => {
    initializeSSE()
    return () => {
      cleanupSSE()
    }
  }, [initializeSSE, cleanupSSE])

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
