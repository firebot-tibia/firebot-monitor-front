import { useCallback } from 'react'

import type { AlertCondition } from '@/components/features/monitoring/types/alert.types'
import type { GuildMemberResponse } from '@/types/guild-member.response'

interface UseGuildProcessorProps {
  onGuildDataProcessed: (data: GuildMemberResponse[]) => void
  onGuildMemberAlert: (members: GuildMemberResponse[], alert: AlertCondition) => void
}

export const useGuildProcessor = ({
  onGuildDataProcessed,
  onGuildMemberAlert,
}: UseGuildProcessorProps) => {
  const processGuildData = useCallback(
    (data: GuildMemberResponse[], currentData: GuildMemberResponse[], alert?: AlertCondition) => {
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

      if (alert && recentlyLoggedIn.length > 0) {
        onGuildMemberAlert(recentlyLoggedIn, alert)
      }

      return { newGuildData, recentlyLoggedIn }
    },
    [onGuildDataProcessed, onGuildMemberAlert],
  )

  const processGuildChanges = useCallback(
    (changes: Record<string, any>, currentData: GuildMemberResponse[], alert?: AlertCondition) => {
      const updatedData = [...currentData]
      const loggedInMembers: GuildMemberResponse[] = []

      Object.entries(changes).forEach(([name, change]) => {
        const memberIndex = updatedData.findIndex(m => m.Name === name)
        if (memberIndex === -1) return

        const member = updatedData[memberIndex]
        const wasOffline = !member.OnlineStatus
        const isNowOnline = change.OnlineStatus

        if (wasOffline && isNowOnline) {
          const updatedMember = { ...member, ...change }
          loggedInMembers.push(updatedMember)
          updatedData[memberIndex] = updatedMember
        } else {
          updatedData[memberIndex] = { ...member, ...change }
        }
      })

      onGuildDataProcessed(updatedData)

      if (alert && loggedInMembers.length > 0) {
        onGuildMemberAlert(loggedInMembers, alert)
      }

      return { updatedData, loggedInMembers }
    },
    [onGuildDataProcessed, onGuildMemberAlert],
  )

  return {
    processGuildData,
    processGuildChanges,
  }
}
