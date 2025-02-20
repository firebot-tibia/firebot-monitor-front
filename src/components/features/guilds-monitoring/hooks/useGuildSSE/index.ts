import { useCallback, useEffect, useMemo, useRef } from 'react'

import { useSession } from 'next-auth/react'

import { FIREBOT_SSE_URL } from '@/common/constants/env'
import { useSSEStore } from '@/common/sse/sse-store'
import { useStorage } from '@/common/stores/storage-store'
import type { GuildMemberResponse } from '@/common/types/guild-member.response'
import { useTokenStore } from '@/components/features/auth/store/token-decoded-store'

interface GuildChange {
  Name: string
  Field: string
  OldValue: string | number | boolean | null
  NewValue: string | number | boolean | null
}

interface UseGuildSSEProps {
  onGuildData: (data: GuildMemberResponse[]) => void
  onGuildChanges: (changes: GuildChange[]) => void
}

export const useGuildSSE = ({ onGuildData, onGuildChanges }: UseGuildSSEProps) => {
  const [value] = useStorage('monitorMode', 'enemy')
  const { data: session } = useSession()
  const { selectedWorld } = useTokenStore()
  const { connect, disconnect, status, getUnprocessedMessages, markMessagesAsProcessed } =
    useSSEStore()
  const processingRef = useRef(false)
  const mountedRef = useRef(true)
  const lastProcessedRef = useRef<number>(0)

  const sseEndpoint = useMemo(() => {
    if (!FIREBOT_SSE_URL) {
      console.error('FIREBOT_SSE_URL is not defined')
      return ''
    }
    const endpoint = `${FIREBOT_SSE_URL}${value}/`
    console.debug('SSE Endpoint:', endpoint)
    return endpoint
  }, [value])

  const processMessages = useCallback(() => {
    if (!mountedRef.current || processingRef.current) return
    processingRef.current = true

    try {
      const unprocessedMessages = getUnprocessedMessages()
      if (unprocessedMessages.length > 0) {
        console.debug(`Processing ${unprocessedMessages.length} messages`)
      }

      let latestTimestamp = lastProcessedRef.current
      unprocessedMessages.forEach(msg => {
        if (!mountedRef.current) return

        try {
          if (msg.type === 'guild-data') {
            console.debug('Received guild data:', msg.data?.length || 0, 'members')
            onGuildData(msg.data)
          } else if (msg.type === 'guild-changes') {
            console.debug('Received guild changes')
            onGuildChanges(msg.data)
          }
          latestTimestamp = Math.max(latestTimestamp, msg.timestamp)
        } catch (error) {
          console.error('Error processing message:', error, msg)
        }
      })

      if (mountedRef.current && latestTimestamp > lastProcessedRef.current) {
        markMessagesAsProcessed(latestTimestamp)
        lastProcessedRef.current = latestTimestamp
      }
    } catch (error) {
      console.error('Error in processMessages:', error)
    } finally {
      processingRef.current = false
    }
  }, [getUnprocessedMessages, markMessagesAsProcessed, onGuildData, onGuildChanges])

  useEffect(() => {
    mountedRef.current = true
    console.debug('SSE Dependencies:', {
      hasSession: !!session?.access_token,
      selectedWorld,
      sseEndpoint,
      status,
    })

    if (session?.access_token && selectedWorld && sseEndpoint) {
      console.debug('Connecting to SSE...')
      connect(sseEndpoint, session.access_token, selectedWorld)
    } else {
      console.warn('Missing required SSE connection parameters')
    }

    return () => {
      console.debug('Cleaning up SSE connection')
      mountedRef.current = false
      processingRef.current = false
      if (status === 'connected') {
        disconnect()
      }
    }
  }, [connect, disconnect, selectedWorld, session?.access_token, sseEndpoint, status])

  useEffect(() => {
    if (!mountedRef.current) return

    const interval = setInterval(() => {
      if (status === 'connected') {
        processMessages()
      }
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [processMessages, status])

  return {
    isConnected: status === 'connected',
    status,
  }
}
