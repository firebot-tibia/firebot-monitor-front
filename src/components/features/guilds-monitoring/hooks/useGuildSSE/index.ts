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
  const { selectedWorld: world } = useTokenStore()
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

  // Use refs to avoid unnecessary re-renders
  const processedDataRef = useRef<GuildMemberResponse[]>([])
  const processedChangesRef = useRef<GuildMemberResponse[]>([])
  const batchUpdateRef = useRef<number | null>(null)

  const processMessages = useCallback(async () => {
    if (!mountedRef.current || status !== 'connected') return

    const unprocessedMessages = getUnprocessedMessages()
    if (unprocessedMessages.length === 0) return

    try {
      console.log('Processing messages:', unprocessedMessages.length)
      let latestTimestamp = lastProcessedRef.current

      // Process all messages first
      for (const msg of unprocessedMessages) {
        if (!mountedRef.current) break
        if (!msg?.data) continue

        try {
          const guildData = msg.data as Record<string, unknown>

          // Process main guild data
          if (guildData[value] && Array.isArray(guildData[value])) {
            const newGuildData = guildData[value] as GuildMemberResponse[]
            processedDataRef.current = newGuildData
          }

          // Process guild changes
          const changesKey = `${value}-changes`
          if (guildData[changesKey] && Array.isArray(guildData[changesKey])) {
            const changes = guildData[changesKey] as GuildMemberResponse[]
            processedChangesRef.current = changes
          }

          latestTimestamp = Math.max(latestTimestamp, msg.timestamp)
        } catch (error) {
          console.error('Failed to process SSE message:', error)
        }
      }

      // Schedule batch update
      if (batchUpdateRef.current) {
        cancelAnimationFrame(batchUpdateRef.current)
      }

      batchUpdateRef.current = requestAnimationFrame(() => {
        // Batch update callbacks
        if (processedDataRef.current.length > 0) {
          console.log('Updating guild data:', processedDataRef.current.length, 'members')
          onGuildData?.(processedDataRef.current)
          processedDataRef.current = []
        }

        if (processedChangesRef.current.length > 0) {
          console.log('Processing guild changes:', processedChangesRef.current.length)
          const changes = processGuildChanges(processedChangesRef.current, [])
          onGuildChanges?.(changes.loggedInMembers)
          processedChangesRef.current = []
        }

        if (mountedRef.current && latestTimestamp > lastProcessedRef.current) {
          lastProcessedRef.current = latestTimestamp
          markMessagesAsProcessed(latestTimestamp)
        }
      })
    } catch (error) {
      console.error('Failed to process messages:', error)
    }
  }, [
    getUnprocessedMessages,
    markMessagesAsProcessed,
    onGuildData,
    onGuildChanges,
    processGuildChanges,
    value,
    status,
  ])

  useEffect(() => {
    mountedRef.current = true
    let connectionTimeout: NodeJS.Timeout

    const connectWithRetry = async () => {
      if (!mountedRef.current) return
      if (session?.access_token && world && sseEndpoint) {
        try {
          await connect(sseEndpoint, session.access_token, world)
        } catch (error) {
          console.error('Failed to connect to SSE:', error)
          // Retry connection after 5 seconds
          connectionTimeout = setTimeout(connectWithRetry, 5000)
        }
      }
    }

    connectWithRetry()

    return () => {
      mountedRef.current = false
      processingRef.current = false
      if (status === 'connected') {
        disconnect()
      }
      if (connectionTimeout) {
        clearTimeout(connectionTimeout)
      }
    }
  }, [world, session?.access_token, sseEndpoint])

  useEffect(() => {
    if (!mountedRef.current) return

    let processingInterval: NodeJS.Timeout

    const processIfConnected = () => {
      if (mountedRef.current && status === 'connected' && !processingRef.current) {
        processMessages()
      }
    }

    if (status === 'connected') {
      // Process immediately when connected
      processIfConnected()
      // Then set up interval for future processing
      processingInterval = setInterval(processIfConnected, 5000)
    }

    return () => {
      if (processingInterval) {
        clearInterval(processingInterval)
      }
    }
  }, [status, processMessages])

  return {
    status,
  }
}
