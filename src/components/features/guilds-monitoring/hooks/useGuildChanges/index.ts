import { useCallback } from 'react'

import type { GuildMemberResponse } from '../../../../../types/guild-member.response'

interface UseGuildChangesReturn {
  processGuildChanges: (
    changes: Record<string, any>,
    currentData: GuildMemberResponse[],
  ) => {
    updatedData: GuildMemberResponse[]
    loggedInMembers: GuildMemberResponse[]
  }
}

export const useGuildChanges = (): UseGuildChangesReturn => {
  const processGuildChanges = useCallback(
    (changes: Record<string, any>, currentData: GuildMemberResponse[]) => {
      const loggedInChanges = new Map<string, GuildMemberResponse>()
      const updatedData = [...currentData]

      Object.entries(changes).forEach(([name, change]: [string, any]) => {
        const index = updatedData.findIndex(member => member.Name === name)
        if (index !== -1) {
          if (change.ChangeType === 'logged-in') {
            const updatedMember = {
              ...updatedData[index],
              ...change.Member,
              OnlineStatus: true,
              OnlineSince: new Date().toISOString(),
              TimeOnline: '00:00:00',
            }
            updatedData[index] = updatedMember
            loggedInChanges.set(name, updatedMember)
          } else if (change.ChangeType === 'logged-out') {
            updatedData[index] = {
              ...updatedData[index],
              ...change.Member,
              OnlineStatus: false,
              OnlineSince: null,
              TimeOnline: null,
            }
            loggedInChanges.delete(name)
          } else {
            updatedData[index] = { ...updatedData[index], ...change.Member }
          }
        }
      })

      return {
        updatedData,
        loggedInMembers: Array.from(loggedInChanges.values()),
      }
    },
    [],
  )

  return { processGuildChanges }
}
