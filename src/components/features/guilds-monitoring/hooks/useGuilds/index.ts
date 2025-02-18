'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useSession } from 'next-auth/react'

import { useAlertMonitoring } from '@/components/features/monitoring/hooks/useAlertMonitoring'
import type { AlertCondition } from '@/components/features/monitoring/types/alert.types'
import { useStorageStore } from '@/stores/storage-store'

import { upsertPlayer } from '../../../../../services/guild-stats'
import { useTokenStore } from '../../../../../stores/token-decoded-store'
import type { GuildMemberResponse } from '../../../../../types/guild-member.response'
import { useCharacterTypes } from '../useCharacterTypes'
import { useGuildData } from '../useGuildData'
import { useGuildLocalUpdater } from '../useGuildLocalUpdater'
import { useGuildProcessor } from '../useGuildProcessor'
import { useGuildSSE } from '../useGuildSSE'
import { useGuildTimeUpdater } from '../useGuildTimeUpdater'

interface UseGuildsProps {
  playSound: (sound: AlertCondition['sound']) => void
}

export const useGuilds = ({ playSound }: UseGuildsProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const { data: session, status } = useSession()
  const guildId = useStorageStore.getState().getItem('selectedGuildId', '')
  const selectedWorld = useStorageStore.getState().getItem('selectedWorld', '')
  const { decodeAndSetToken } = useTokenStore()

  const { guildData, setGuildData, updateMemberData } = useGuildData()
  const { types, addType } = useCharacterTypes(guildData)
  const { checkAndTriggerAlerts } = useAlertMonitoring()
  const { handleLocalChange } = useGuildLocalUpdater(updateMemberData)

  useGuildTimeUpdater({ setGuildData })

  const processNewGuildData = useCallback(
    (data: GuildMemberResponse[]) => {
      if (!Array.isArray(data)) return

      // Use requestAnimationFrame to batch updates
      requestAnimationFrame(() => {
        console.debug('Processing guild data:', {
          count: data.length,
          onlineCount: data.filter(m => m.OnlineStatus).length,
        })
        setGuildData(prevData => {
          // Only update if data actually changed
          if (JSON.stringify(prevData) === JSON.stringify(data)) {
            return prevData
          }
          return data
        })
      })
    },
    [setGuildData],
  )

  const handleGuildDataProcessed = useCallback(
    (data: GuildMemberResponse[]) => {
      if (!Array.isArray(data)) return
      processNewGuildData(data)
    },
    [processNewGuildData],
  )

  const handleGuildMemberAlert = useCallback(
    (members: GuildMemberResponse[], alert: AlertCondition) => {
      playSound(alert.sound)
    },
    [playSound],
  )

  const { processGuildData, processGuildChanges } = useGuildProcessor({
    onGuildDataProcessed: handleGuildDataProcessed,
    onGuildMemberAlert: handleGuildMemberAlert,
  })

  const handleGuildData = useCallback(
    (rawData: unknown[]) => {
      if (!Array.isArray(rawData)) return

      // Type guard to ensure data matches GuildMemberResponse
      const isGuildMember = (item: unknown): item is GuildMemberResponse => {
        if (!item || typeof item !== 'object') return false
        const member = item as Partial<GuildMemberResponse>
        return (
          typeof member.Name === 'string' &&
          typeof member.Vocation === 'string' &&
          typeof member.Level === 'number' &&
          typeof member.OnlineStatus === 'boolean' &&
          typeof member.Kind === 'string'
        )
      }

      // Filter and type cast the data
      const data = rawData.filter(isGuildMember)

      if (data.length !== rawData.length) {
        console.warn('Some guild members had invalid data format', {
          total: rawData.length,
          valid: data.length,
        })
      }

      console.log('Received new guild data:', {
        count: data.length,
        onlineCount: data.filter(m => m.OnlineStatus).length,
        sample: data.slice(0, 2),
      })

      const { recentlyLoggedIn } = processGuildData(data, guildData)
      handleGuildDataProcessed(data)

      if (recentlyLoggedIn.length > 0) {
        const { reachedThreshold, alert } = checkAndTriggerAlerts(recentlyLoggedIn)
        if (reachedThreshold && alert) {
          handleGuildMemberAlert(recentlyLoggedIn, alert)
        }
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

  const handleGuildChanges = useCallback(
    (changes: Record<string, any>) => {
      // Debounce changes processing
      requestAnimationFrame(() => {
        const { updatedData, loggedInMembers } = processGuildChanges(changes, guildData)

        // Only update if we have changes
        if (updatedData.length > 0) {
          handleGuildDataProcessed(updatedData)
        }

        // Handle alerts for logged in members
        if (loggedInMembers.length > 0) {
          const { reachedThreshold, alert } = checkAndTriggerAlerts(loggedInMembers)
          if (reachedThreshold && alert) {
            handleGuildMemberAlert(loggedInMembers, alert)
          }
        }
      })
    },
    [
      guildData,
      processGuildChanges,
      checkAndTriggerAlerts,
      handleGuildMemberAlert,
      handleGuildDataProcessed,
    ],
  )

  const { status: sseStatus } = useGuildSSE({
    onGuildData: handleGuildData,
    onGuildChanges: handleGuildChanges,
  })

  useEffect(() => {
    if (sseStatus === 'connected') {
      setIsLoading(false)
    } else if (sseStatus === 'connecting') {
      setIsLoading(true)
    }
  }, [sseStatus])

  useEffect(() => {
    if (status === 'authenticated' && session?.access_token) {
      decodeAndSetToken(session.access_token)
    }
  }, [status, session, decodeAndSetToken])

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
      } catch (error) {
        throw error
      }
    },
    [guildId, selectedWorld, updateMemberData],
  )

  const groupedData = useMemo(() => {
    if (!types?.length || !guildData?.length) return []

    console.log('Calculating grouped data:', {
      typesLength: types.length,
      guildDataLength: guildData.length,
    })

    // Use Map for O(1) lookups
    const groupsByType = new Map<string, GuildMemberResponse[]>()
    const defaultType = 'main'

    // Pre-initialize all type arrays
    types.forEach(type => {
      groupsByType.set(type, [])
    })

    // Single pass member distribution with pre-allocated arrays
    const membersByType = guildData.reduce((acc, member) => {
      const type = member.Kind || defaultType
      const group = acc.get(type) || acc.get(defaultType)
      if (group) {
        group.push(member)
      } else {
        acc.set(type, [member])
      }
      return acc
    }, groupsByType)

    // Create final grouped data with a single pass
    const grouped = Array.from(membersByType.entries())
      .filter(([_, members]) => members.length > 0)
      .map(([type, members]) => ({
        type,
        data: members,
        onlineCount: members.reduce((count, member) => count + (member.OnlineStatus ? 1 : 0), 0),
      }))
      .sort((a, b) => b.onlineCount - a.onlineCount) // Sort by online count

    console.log('Grouped data result:', {
      totalGroups: grouped.length,
      groupSizes: grouped.map(g => ({ type: g.type, size: g.data.length })),
    })

    return grouped
  }, [types, guildData])

  return {
    guildData,
    isLoading,
    handleLocalChange,
    handleClassificationChange,
    types,
    addType,
    groupedData,
    status,
    sseStatus,
  }
}
