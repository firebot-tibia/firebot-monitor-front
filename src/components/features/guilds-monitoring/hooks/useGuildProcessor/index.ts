import { useCallback } from 'react'

import type { GuildMemberResponse } from '@/common/types/guild-member.response'
import type { AlertCondition } from '@/components/features/monitoring/types/alert.types'

interface UseGuildProcessorProps {
  onGuildDataProcessed: (data: GuildMemberResponse[]) => void
  onGuildMemberAlert: (members: GuildMemberResponse[], alert: AlertCondition) => void
}

export const useGuildProcessor = ({
  onGuildDataProcessed,
  onGuildMemberAlert,
}: UseGuildProcessorProps) => {
  const processGuildData = useCallback(
    (data: GuildMemberResponse[], currentData: GuildMemberResponse[]) => {
      const currentTime = new Date()
      const newGuildData = data.map((member: GuildMemberResponse) => ({
        ...member,
        OnlineSince: member.OnlineStatus ? member.OnlineSince || currentTime.toISOString() : null,
        TimeOnline: member.OnlineStatus ? '00:00:00' : null,
      }))

      const processedNames = new Set(currentData.map(member => member.Name))
      const recentlyLoggedIn = newGuildData.filter((member: GuildMemberResponse) => {
        if (!member.OnlineStatus || !member.OnlineSince || processedNames.has(member.Name))
          return false
        const onlineSince = new Date(member.OnlineSince)
        const onlineTimeSeconds = (currentTime.getTime() - onlineSince.getTime()) / 1000
        return onlineTimeSeconds <= 180 // 3 minutes in seconds
      })

      onGuildDataProcessed(newGuildData)
      return { newGuildData, recentlyLoggedIn }
    },
    [onGuildDataProcessed],
  )

  const processGuildChanges = useCallback(
    (changes: Record<string, any>, currentData: GuildMemberResponse[]) => {
      const updatedData = [...currentData]
      const loggedInMembers: GuildMemberResponse[] = []

      Object.entries(changes).forEach(([name, change]) => {
        const memberIndex = updatedData.findIndex(m => m.Name === name)
        if (memberIndex === -1) return

        const member = updatedData[memberIndex]
        const wasOffline = !member.OnlineStatus
        const isNowOnline = change.OnlineStatus

        if (wasOffline && isNowOnline) {
          loggedInMembers.push({ ...member, ...change })
        }

        updatedData[memberIndex] = { ...member, ...change }
      })

      onGuildDataProcessed(updatedData)
      return { updatedData, loggedInMembers }
    },
    [onGuildDataProcessed],
  )

  return {
    processGuildData,
    processGuildChanges,
  }
}
