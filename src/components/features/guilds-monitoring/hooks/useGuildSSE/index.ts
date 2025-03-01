import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useSession } from 'next-auth/react'

import { FIREBOT_SSE_URL } from '@/common/constants/env'
import type {
  GuildChange,
  ConnectionStatus,
  SSEMessage,
  GuildData,
  GuildChanges,
} from '@/common/sse/services/types'
import { useSSEStore } from '@/common/sse/sse-store'
import { useStorage } from '@/common/stores/storage-store'
import type { GuildMemberResponse } from '@/common/types/guild-member.response'
import { useTokenStore } from '@/components/features/auth/store/token-decoded-store'

interface UseGuildSSEProps {
  onGuildData: (data: GuildMemberResponse[]) => void
  onGuildChanges: (changes: GuildChange[]) => void
}

/**
 * Hook for managing SSE connections for guild data with optimized update handling
 */
export const useGuildSSE = ({ onGuildData, onGuildChanges }: UseGuildSSEProps) => {
  // External state
  const [monitorMode] = useStorage('monitorMode', 'enemy')
  const { data: session } = useSession()
  const { selectedWorld } = useTokenStore()

  // Connection state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')

  // SSE connection management
  const { connect, disconnect, status, getUnprocessedMessages, markMessagesAsProcessed } =
    useSSEStore()

  // Use refs for internal state to minimize re-renders
  const mountedRef = useRef(true)
  const processingRef = useRef(false)
  const lastProcessedRef = useRef<number>(0)

  // Construct SSE endpoint URL
  const sseEndpoint = useMemo(() => {
    if (!FIREBOT_SSE_URL) {
      console.error('[Guild SSE] FIREBOT_SSE_URL is not defined')
      return ''
    }
    return FIREBOT_SSE_URL
  }, [])

  /**
   * Process incoming messages
   */
  const processMessages = useCallback(() => {
    console.log('[Guild SSE Debug] Starting to process messages')
    // Avoid processing if component unmounted or already processing
    if (!mountedRef.current || processingRef.current) return
    processingRef.current = true

    try {
      // Get all unprocessed messages
      const messages = getUnprocessedMessages()
      console.log('[Guild SSE Debug] Got unprocessed messages:', messages)
      let lastTimestamp = lastProcessedRef.current

      // Process each message based on type
      messages.forEach((message: SSEMessage) => {
        console.log('[Guild SSE Debug] Processing message:', message)
        if (message.timestamp <= lastProcessedRef.current) return

        switch (message.type) {
          case 'guild_data': {
            console.log('[Guild SSE Debug] Message data structure:', {
              isArray: Array.isArray(message.data),
              dataType: typeof message.data,
              rawData: message.data,
            })
            const members = Array.isArray(message.data)
              ? message.data
              : (message.data as GuildData).members
            console.log('[Guild SSE Debug] Processing guild data:', { memberCount: members })
            onGuildData(members)
            break
          }
          case 'guild_changes': {
            console.log('[Guild SSE Debug] Changes data structure:', {
              isArray: Array.isArray(message.data),
              dataType: typeof message.data,
              rawData: message.data,
            })
            // Handle both array and object formats
            let changes: GuildChange[]
            if (Array.isArray(message.data)) {
              changes = message.data
            } else if (message.data && typeof message.data === 'object') {
              // Try to extract changes from various possible structures
              const data = message.data as any
              console.log('[Guild SSE Debug] Changes data:', {
                data,
                hasChanges: !!data.changes,
                hasMonitorModeChanges: !!data[`${monitorMode}-changes`],
                monitorModeChangesKey: `${monitorMode}-changes`,
                keys: Object.keys(data),
              })
              if (data.changes) {
                changes = data.changes
              } else if (data[`${monitorMode}-changes`]) {
                const changesData = data[`${monitorMode}-changes`]
                console.log('[Guild SSE Debug] Monitor mode changes:', {
                  changesData,
                  keys: Object.keys(changesData),
                })
                // Convert object of changes to array
                changes = Object.entries(changesData).map(([name, change]: [string, any]) => ({
                  ...change,
                  Name: name,
                }))
              } else {
                // If no recognized structure, treat the object itself as a change
                changes = [data]
              }
            } else {
              console.error('[Guild SSE Debug] Invalid changes data structure:', message.data)
              changes = []
            }
            console.log('[Guild SSE Debug] Processing guild changes:', { changes })
            onGuildChanges(changes)
            break
          }
          case 'error':
            console.error('[Guild SSE] Error message received:', message.data)
            break
          case 'heartbeat':
            // Ignore heartbeat messages
            break
        }

        lastTimestamp = Math.max(lastTimestamp, message.timestamp)
      })

      // Update last processed timestamp
      if (lastTimestamp > lastProcessedRef.current) {
        lastProcessedRef.current = lastTimestamp
        markMessagesAsProcessed(lastTimestamp)
      }
    } catch (error) {
      console.error('[Guild SSE] Error processing messages:', error)
    } finally {
      processingRef.current = false
    }
  }, [getUnprocessedMessages, markMessagesAsProcessed, onGuildData, onGuildChanges])

  // Connect to SSE when dependencies are available
  useEffect(() => {
    if (typeof window === 'undefined') return

    mountedRef.current = true

    const connectToSSE = () => {
      if (!mountedRef.current) return

      if (session?.access_token && selectedWorld && sseEndpoint) {
        setConnectionStatus('connecting')

        // Use refresh token as fallback
        const refreshToken = session.refresh_token || session.access_token
        connect(sseEndpoint, session.access_token, refreshToken, selectedWorld, monitorMode)
      }
    }

    // Small delay to avoid hydration issues
    const timer = setTimeout(connectToSSE, 200)

    // Clean up resources on unmount
    return () => {
      clearTimeout(timer)
      mountedRef.current = false
      disconnect()
    }
  }, [
    connect,
    disconnect,
    monitorMode,
    selectedWorld,
    session?.access_token,
    session?.refresh_token,
    sseEndpoint,
  ])

  // Sync status changes
  useEffect(() => {
    if (status !== connectionStatus) {
      setConnectionStatus(status)
    }
  }, [status, connectionStatus])

  // Set up unified message processing
  useEffect(() => {
    if (typeof window === 'undefined' || status !== 'connected' || !mountedRef.current) return

    // Process initial messages
    processMessages()

    // Set up interval for regular processing
    const processInterval = setInterval(processMessages, 250)

    // Process on tab visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && status === 'connected') {
        processMessages()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(processInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [status, processMessages])

  // Return minimal interface to reduce re-renders
  return {
    isConnected: connectionStatus === 'connected',
    status: connectionStatus,
  }
}
