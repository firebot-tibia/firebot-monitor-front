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

interface GroupedData {
  type: string
  data: GuildMemberResponse[]
  onlineCount: number
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

  const handleGuildDataProcessed = useCallback(
    (newData: GuildMemberResponse[]) => {
      if (!Array.isArray(newData)) {
        return
      }
      console.debug('Processing guild data:', {
        count: newData.length,
        onlineCount: newData.filter(m => m.OnlineStatus).length,
      })
      setGuildData(newData)
    },
    [setGuildData],
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
    (data: GuildMemberResponse[]) => {
      if (!Array.isArray(data)) {
        return
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
      const { updatedData, loggedInMembers } = processGuildChanges(changes, guildData)
      handleGuildDataProcessed(updatedData)

      if (loggedInMembers.length > 0) {
        const { reachedThreshold, alert } = checkAndTriggerAlerts(loggedInMembers)
        if (reachedThreshold && alert) {
          handleGuildMemberAlert(loggedInMembers, alert)
        }
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
    console.log('Calculating grouped data:', {
      typesLength: types?.length,
      guildDataLength: guildData?.length,
    })

    const grouped: GroupedData[] = []
    if (!guildData?.length) return grouped

    // Create a default group for unclassified members
    const defaultType = 'Unclassified'
    const groupsByType = new Map<string, GuildMemberResponse[]>()

    // Initialize groups for all types
    types?.forEach(type => {
      groupsByType.set(type, [])
    })
    groupsByType.set(defaultType, [])

    // Distribute members to groups
    guildData.forEach(member => {
      const type = member.Kind || defaultType
      const group = groupsByType.get(type) || groupsByType.get(defaultType)!
      group.push(member)
    })

    // Create final grouped data
    groupsByType.forEach((members, type) => {
      if (members.length > 0) {
        grouped.push({
          type,
          data: members,
          onlineCount: members.filter(member => member.OnlineStatus).length,
        })
      }
    })

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
