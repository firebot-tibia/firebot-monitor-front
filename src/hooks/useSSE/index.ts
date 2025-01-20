import { useState, useRef, useEffect } from 'react'

import { signOut, useSession } from 'next-auth/react'

import { SSEManager } from '@/services/sse'
import { useTokenStore } from '@/stores/token-decoded-store'

import type { ConnectionStatus, UseSSEOptions } from './types'

export const useSSE = ({ endpoint, onMessage }: UseSSEOptions) => {
  const { data: session } = useSession()
  const { selectedWorld, decodeAndSetToken } = useTokenStore()
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const sseManager = useRef<SSEManager | null>(null)

  useEffect(() => {
    if (session?.access_token && session?.refresh_token && selectedWorld) {
      const fullUrl = `${endpoint}${endpoint.includes('?') ? '&' : '?'}token=${encodeURIComponent(session.access_token)}&world=${selectedWorld}`

      sseManager.current = new SSEManager({
        url: fullUrl,
        token: session.access_token,
        refreshToken: session.refresh_token,
        onMessage,
        onTokenRefresh: decodeAndSetToken,
        onStatusChange: setStatus,
        onMaxRetriesReached: async () => {
          await signOut({ callbackUrl: '/' })
        },
      })

      sseManager.current.connect()

      return () => {
        sseManager.current?.closeConnection()
      }
    }
  }, [
    endpoint,
    session?.access_token,
    session?.refresh_token,
    selectedWorld,
    onMessage,
    decodeAndSetToken,
  ])

  return {
    status,
    isConnected: status === 'connected',
  }
}
