'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useSession } from 'next-auth/react'

import { LoggerService } from '@/common/hooks/useLogger/logger.service'
import { useStorageStore } from '@/common/stores/storage-store'
import { useAlertMonitoring } from '@/components/features/monitoring/hooks/useAlertMonitoring'
import type { AlertCondition } from '@/components/features/monitoring/types/alert.types'

import type { GuildMemberResponse } from '../../../../../common/types/guild-member.response'
import { useTokenStore } from '../../../auth/store/token-decoded-store'
import { upsertPlayer } from '../../../statistics/services'
import { useCharacterTypes } from '../useCharacterTypes'
import { useGuildData } from '../useGuildData'
import { useGuildLocalUpdater } from '../useGuildLocalUpdater'
import { useGuildProcessor } from '../useGuildProcessor'
import { useGuildSSE } from '../useGuildSSE'
import { useGuildTimeUpdater } from '../useGuildTimeUpdater'

/**
 * Types for the useGuilds hook
 */
interface UseGuildsProps {
  playSound: (sound: AlertCondition['sound']) => void
}

interface GroupedData {
  type: string
  data: GuildMemberResponse[]
  onlineCount: number
}

interface UseGuildsReturn {
  guildData: GuildMemberResponse[]
  isLoading: boolean
  isConnected: boolean
  handleLocalChange: (member: GuildMemberResponse, newLocal: string) => void
  handleClassificationChange: (member: GuildMemberResponse, newType: string) => Promise<void>
  types: string[]
  addType: (type: string) => void
  groupedData: GroupedData[]
  status: string
}

/**
 * Main hook for guild data management and processing
 */
export const useGuilds = ({ playSound }: UseGuildsProps): UseGuildsReturn => {
  // State
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Session and storage data
  const { data: session, status: sessionStatus } = useSession()
  const { decodeAndSetToken } = useTokenStore()
  const guildId = useStorageStore.getState().getItem('selectedGuildId', '')
  const selectedWorld = useStorageStore.getState().getItem('selectedWorld', '')

  // Initialize base hooks
  const { guildData, setGuildData, updateMemberData, processNewGuildData } = useGuildData()
  const { types, addType } = useCharacterTypes(guildData)
  const { checkAndTriggerAlerts } = useAlertMonitoring()
  const { handleLocalChange } = useGuildLocalUpdater(updateMemberData)

  // Prevent unnecessary re-renders
  const guildDataRef = useRef(guildData)
  const typesRef = useRef(types)

  useEffect(() => {
    guildDataRef.current = guildData
    typesRef.current = types
  }, [guildData, types])

  // Setup automatic time updates
  useGuildTimeUpdater({ setGuildData })

  /**
   * Process and validate new guild data
   */
  const handleGuildDataProcessed = useCallback(
    (newData: GuildMemberResponse[]) => {
      console.log('[Guilds Hook] Processing guild data:', {
        isArray: Array.isArray(newData),
        length: newData?.length,
        sample: newData?.[0],
      })
      if (!Array.isArray(newData) || newData.length === 0) return

      setIsLoading(false)
      processNewGuildData(newData)
    },
    [processNewGuildData, setIsLoading],
  )

  /**
   * Handle alerts when triggered
   */
  const handleGuildMemberAlert = useCallback(
    (members: GuildMemberResponse[], alert: AlertCondition) => {
      playSound(alert.sound)
    },
    [playSound],
  )

  // Initialize guild processor
  const { processGuildData, processGuildChanges } = useGuildProcessor({
    onGuildDataProcessed: handleGuildDataProcessed,
    onGuildMemberAlert: handleGuildMemberAlert,
  })

  /**
   * Process new guild data from SSE
   */
  const handleGuildData = useCallback(
    (data: GuildMemberResponse[]) => {
      console.log('[Guilds Hook] Handling guild data:', {
        isArray: Array.isArray(data),
        length: data?.length,
        sample: data?.[0],
      })
      if (!Array.isArray(data) || data.length === 0) return

      try {
        // Process data and get members who recently logged in
        const { recentlyLoggedIn } = processGuildData(data, guildDataRef.current)

        // Update guild data with new information
        handleGuildDataProcessed(data)

        // Handle alerts for recently logged in members
        if (recentlyLoggedIn.length > 0) {
          const { reachedThreshold, alert } = checkAndTriggerAlerts(recentlyLoggedIn)
          if (reachedThreshold && alert) {
            handleGuildMemberAlert(recentlyLoggedIn, alert)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to process guild data'))
      }
    },
    [
      guildData,
      processGuildData,
      checkAndTriggerAlerts,
      handleGuildMemberAlert,
      handleGuildDataProcessed,
    ],
  )

  /**
   * Process guild changes from SSE
   */
  const handleGuildChanges = useCallback(
    (changes: any) => {
      if (!changes) return

      try {
        const { updatedData, loggedInMembers } = processGuildChanges(changes, guildData)

        // Update guild data if we have changes
        if (updatedData.length > 0) {
          handleGuildDataProcessed(updatedData)
        }

        // Handle alerts for members who just logged in
        if (loggedInMembers.length > 0) {
          const { reachedThreshold, alert } = checkAndTriggerAlerts(loggedInMembers)
          if (reachedThreshold && alert) {
            handleGuildMemberAlert(loggedInMembers, alert)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to process guild changes'))
      }
    },
    [
      guildData,
      processGuildChanges,
      checkAndTriggerAlerts,
      handleGuildMemberAlert,
      handleGuildDataProcessed,
    ],
  )

  // Connect to SSE data source
  const { status: sseStatus, isConnected } = useGuildSSE({
    onGuildData: handleGuildData,
    onGuildChanges: handleGuildChanges,
  })

  // Handle SSE connection status changes
  useEffect(() => {
    if (sseStatus === 'connected') {
      setIsLoading(false)
    } else if (sseStatus === 'connecting') {
      setIsLoading(true)
    } else if (sseStatus === 'disconnected') {
      // Only show loading if we have no data
      setIsLoading(!guildData.length)
    }
  }, [sseStatus, guildData.length])

  // Set token when session is authenticated
  useEffect(() => {
    if (sessionStatus === 'authenticated' && session?.access_token) {
      decodeAndSetToken(session.access_token)
    }
  }, [sessionStatus, session, decodeAndSetToken])

  /**
   * Update member classification
   */
  const handleClassificationChange = useCallback(
    async (member: GuildMemberResponse, newType: string) => {
      try {
        const playerData = {
          guild_id: guildId,
          kind: newType,
          name: member.Name,
          status: member.Status,
          local: member.Local,
        }

        await upsertPlayer(playerData, selectedWorld)
        updateMemberData(member, { Kind: newType })
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update player classification'))
        throw err
      }
    },
    [guildId, selectedWorld, updateMemberData],
  )

  /**
   * Group guild data by type for display
   */
  const groupedData = useMemo(() => {
    const currentData = guildDataRef.current
    const currentTypes = typesRef.current

    console.log('[Guilds Hook] Grouping data:', {
      guildDataLength: currentData?.length,
      types: currentTypes,
      sample: currentData?.[0],
    })

    const grouped: GroupedData[] = []
    if (!currentData?.length) return grouped

    // Default types if none are set
    const effectiveTypes = currentTypes?.length
      ? currentTypes
      : ['main', 'hunted', 'maker', 'bomba']

    // Group members by their Kind
    const groupsByKind = new Map<string, GuildMemberResponse[]>()

    for (const member of currentData) {
      const kind = member.Kind || 'main'
      const group = groupsByKind.get(kind) || []
      group.push(member)
      groupsByKind.set(kind, group)
    }

    // Create groups for each type with members
    for (const type of effectiveTypes) {
      const typeData = groupsByKind.get(type) || []
      if (typeData.length > 0) {
        grouped.push({
          type,
          data: typeData,
          onlineCount: typeData.filter(member => member.OnlineStatus).length,
        })
      }
    }

    return grouped
  }, [])

  return {
    guildData,
    isLoading,
    isConnected,
    handleLocalChange,
    handleClassificationChange,
    types,
    addType,
    groupedData,
    status: error ? 'error' : sseStatus,
  }
}
