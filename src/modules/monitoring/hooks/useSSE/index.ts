import { useCallback, useEffect, useRef, useState } from 'react'

import { useSession } from 'next-auth/react'

import { SSEClient } from '@/core/sse/services'
import type { ConnectionStatus, SSEConfig, SSEMessage } from '@/core/sse/services/types'
import { TokenManager } from '@/modules/auth/services'
import { useTokenStore } from '@/modules/auth/store/token-decoded-store'

interface UseSSEProps {
  endpoint: string
  onMessage: (data: any) => void
  onError?: (error: Error) => void
  reconnectOnError?: boolean
  reconnectInterval?: number
}

export const useSSE = ({
  endpoint,
  onMessage,
  onError,
  reconnectOnError = true,
  reconnectInterval = 1000,
}: UseSSEProps) => {
  const { data: session, update: updateSession } = useSession()
  const { selectedWorld } = useTokenStore()
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const sseClientRef = useRef<SSEClient | null>(null)
  const lastMessageRef = useRef<string>('') // Cache last message to prevent duplicates
  const isConnected = status === 'connected'
  const tokenManager = useRef(TokenManager.getInstance())

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

  const handleMaxRetriesReached = useCallback(async () => {
    setStatus('disconnected')

    if (reconnectOnError) {
      setTimeout(() => {
        cleanupSSE()
        initializeSSE()
      }, reconnectInterval)
    }
  }, [reconnectOnError, reconnectInterval])

  const handleTokenRefresh = useCallback(
    async (currentToken: string, currentRefreshToken: string) => {
      if (!session?.refresh_token || !session?.access_token) {
        console.warn('No refresh token or access token available')
        throw new Error('No tokens available')
      }

      try {
        // Extract user ID from the current access token
        const userId = tokenManager.current.extractUserIdFromToken(currentToken)
        if (!userId) {
          console.error('Could not extract user ID from token')
          throw new Error('Invalid token')
        }

        // Perform token refresh
        const newTokens = await tokenManager.current.refreshToken(userId, currentRefreshToken)
        if (!newTokens?.access_token) {
          console.error('No access token in refresh response')
          throw new Error('Token refresh failed')
        }

        // Update session with new tokens
        const newRefreshToken = newTokens.refresh_token || currentRefreshToken
        await updateSession({
          ...session,
          access_token: newTokens.access_token,
          refresh_token: newRefreshToken,
        })

        return {
          token: newTokens.access_token,
          refreshToken: newRefreshToken,
        }
      } catch (error) {
        console.error('Token refresh failed:', error)
        throw error
      }
    },
    [session, updateSession],
  )

  const cleanupSSE = useCallback(() => {
    if (sseClientRef.current) {
      sseClientRef.current.closeConnection()
      sseClientRef.current = null
      setStatus('disconnected')
    }
  }, [])

  const initializeSSE = useCallback(() => {
    if (
      !session ||
      !session.access_token ||
      !session.refresh_token ||
      !selectedWorld ||
      sseClientRef.current
    )
      return

    // Add performance parameters to URL
    const url = new URL(endpoint)

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
    handleMessageDebounced,
    onError,
    session,
    selectedWorld,
    handleMaxRetriesReached,
    cleanupSSE,
    handleTokenRefresh,
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
