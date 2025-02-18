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
      console.log('Processing guild data:', {
        dataLength: data.length,
        currentDataLength: currentData.length,
      })

      // Create a map of current data for quick lookup
      const currentDataMap = new Map(currentData.map(member => [member.Name, member]))

      // Process new data while preserving existing information
      const newGuildData = data.map((member: GuildMemberResponse) => {
        const existingMember = currentDataMap.get(member.Name)
        return {
          ...member,
          OnlineSince: member.OnlineStatus
            ? member.OnlineSince || existingMember?.OnlineSince || currentTime.toISOString()
            : null,
          TimeOnline: member.OnlineStatus ? existingMember?.TimeOnline || '00:00:00' : null,
          Kind: existingMember?.Kind || member.Kind,
          Local: existingMember?.Local || member.Local,
        }
      })

      // Find recently logged in members
      const recentlyLoggedIn = newGuildData.filter((member: GuildMemberResponse) => {
        if (!member.OnlineStatus || !member.OnlineSince) return false

        const existingMember = currentDataMap.get(member.Name)
        if (existingMember?.OnlineStatus) return false // Already online

        const onlineSince = new Date(member.OnlineSince)
        const onlineTimeSeconds = (currentTime.getTime() - onlineSince.getTime()) / 1000
        return onlineTimeSeconds <= 180 // 3 minutes in seconds
      })

      // Create a new array to force state update
      const finalData = [...newGuildData]
      console.log('Processed guild data:', {
        inputCount: data.length,
        outputCount: finalData.length,
        recentlyLoggedIn: recentlyLoggedIn.length,
      })

      onGuildDataProcessed(finalData)

      if (alert && recentlyLoggedIn.length > 0) {
        onGuildMemberAlert(recentlyLoggedIn, alert)
      }

      return { newGuildData: finalData, recentlyLoggedIn }
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

      // Create a new array to force state update
      const finalData = [...updatedData]
      console.log('Processed guild changes:', {
        changesCount: Object.keys(changes).length,
        updatedCount: finalData.length,
        loggedInCount: loggedInMembers.length,
      })

      onGuildDataProcessed(finalData)

      if (alert && loggedInMembers.length > 0) {
        onGuildMemberAlert(loggedInMembers, alert)
      }

      return { updatedData: finalData, loggedInMembers }
    },
    [onGuildDataProcessed, onGuildMemberAlert],
  )

  return {
    processGuildData,
    processGuildChanges,
  }
}
