import { useRef, useMemo, useCallback, useEffect } from 'react'

import { useSession } from 'next-auth/react'

import { FIREBOT_SSE_URL } from '@/constants/env'
import { useSSEStore } from '@/stores/sse-store'
import { useStorage } from '@/stores/storage-store'
import { useTokenStore } from '@/stores/token-decoded-store'
import type { GuildMemberResponse } from '@/types/guild-member.response'

import { useGuildChanges } from '../useGuildChanges'

interface UseGuildSSEProps {
  onGuildData?: (data: GuildMemberResponse[]) => void
  onGuildChanges?: (changes: GuildMemberResponse[]) => void
}

export const useGuildSSE = ({ onGuildData, onGuildChanges }: UseGuildSSEProps = {}) => {
  const [value] = useStorage('monitorMode', 'enemy')
  const { data: session } = useSession()
  const { selectedWorld } = useTokenStore()
  const { connect, disconnect, status, getUnprocessedMessages, markMessagesAsProcessed } =
    useSSEStore()
  const { processGuildChanges } = useGuildChanges()
  const processingRef = useRef(false)
  const mountedRef = useRef(true)
  const lastProcessedRef = useRef<number>(0)

  const sseEndpoint = useMemo(() => {
    if (!FIREBOT_SSE_URL) {
      return ''
    }
    const endpoint = `${FIREBOT_SSE_URL}${value}/`
    return endpoint
  }, [value])

  const processMessages = useCallback(() => {
    if (!mountedRef.current || processingRef.current) return
    processingRef.current = true

    try {
      const unprocessedMessages = getUnprocessedMessages()
      // Processing messages silently

      let latestTimestamp = lastProcessedRef.current
      unprocessedMessages.forEach(msg => {
        if (!mountedRef.current) return

        try {
          const guildData = msg.data as Record<string, any>
          if (guildData[value]) {
            const newGuildData = guildData[value].map((member: GuildMemberResponse) => ({
              ...member,
              OnlineSince: member.OnlineStatus
                ? member.OnlineSince || new Date().toISOString()
                : null,
              TimeOnline: member.OnlineStatus ? '00:00:00' : null,
            }))
            onGuildData?.(newGuildData)
          }

          const changesKey = `${value}-changes`
          if (guildData[changesKey]) {
            const changes = guildData[changesKey]
            const { loggedInMembers } = processGuildChanges(changes, [])
            if (loggedInMembers.length > 0) {
              onGuildChanges?.(loggedInMembers)
            }
          }
          latestTimestamp = Math.max(latestTimestamp, msg.timestamp)
        } catch (error) {
          // eslint-disable-next-line no-console
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
  }, [
    getUnprocessedMessages,
    markMessagesAsProcessed,
    onGuildData,
    onGuildChanges,
    processGuildChanges,
    value,
  ])

  useEffect(() => {
    mountedRef.current = true
    if (session?.access_token && selectedWorld && sseEndpoint) {
      connect(sseEndpoint, session.access_token, selectedWorld)
    }

    return () => {
      mountedRef.current = false
      processingRef.current = false
      if (status === 'connected') {
        disconnect()
      }
    }
  }, [connect, disconnect, selectedWorld, session?.access_token, sseEndpoint, status])

  useEffect(() => {
    if (!mountedRef.current) return

    const processIfConnected = () => {
      if (status === 'connected') {
        processMessages()
      }
    }

    // Process immediately when connected
    processIfConnected()

    // Then set up interval for future processing
    const interval = setInterval(processIfConnected, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [status, processMessages])

  return {
    status,
  }
}
