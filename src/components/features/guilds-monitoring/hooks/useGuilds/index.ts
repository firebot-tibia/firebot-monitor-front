'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useSession } from 'next-auth/react'

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
        console.warn('Invalid guild data received:', newData)
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
        console.warn('Invalid guild data received:', data)
        return
      }

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

  const { status: sseStatus, isConnected } = useGuildSSE({
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
    const grouped: GroupedData[] = []
    if (!types?.length || !guildData?.length) return grouped

    types.forEach(type => {
      const typeData = guildData.filter(member => member.Kind === type)
      if (typeData.length > 0) {
        grouped.push({
          type,
          data: typeData,
          onlineCount: typeData.filter(member => member.OnlineStatus).length,
        })
      }
    })

    return grouped
  }, [types, guildData])

  return {
    guildData,
    isLoading,
    isConnected,
    handleLocalChange,
    handleClassificationChange,
    types,
    addType,
    groupedData,
    status,
  }
}
