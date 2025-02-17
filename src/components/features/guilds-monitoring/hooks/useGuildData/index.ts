import { useCallback, useState } from 'react'

import type { GuildMemberResponse } from '../../../../../types/guild-member.response'

interface UseGuildDataReturn {
  guildData: GuildMemberResponse[]
  setGuildData: React.Dispatch<React.SetStateAction<GuildMemberResponse[]>>
  updateMemberData: (member: GuildMemberResponse, changes: Partial<GuildMemberResponse>) => void
  processNewGuildData: (
    data: GuildMemberResponse[],
    currentGuildData: GuildMemberResponse[],
  ) => {
    newGuildData: GuildMemberResponse[]
    recentlyLoggedIn: GuildMemberResponse[]
  }
}

export const useGuildData = (): UseGuildDataReturn => {
  const [guildData, setGuildData] = useState<GuildMemberResponse[]>(() => {
    console.debug('Initializing guild data state')
    return []
  })

  const updateMemberData = useCallback(
    (member: GuildMemberResponse, changes: Partial<GuildMemberResponse>) => {
      console.debug('Updating member data:', { member: member.Name, changes })
      setGuildData(prevData => {
        const newData = prevData.map(m => (m.Name === member.Name ? { ...m, ...changes } : m))
        return newData
      })
    },
    [],
  )

  const processNewGuildData = useCallback(
    (data: GuildMemberResponse[], currentGuildData: GuildMemberResponse[]) => {
      console.debug('Processing new guild data:', {
        newDataCount: data.length,
        currentDataCount: currentGuildData.length,
      })

      const currentTime = new Date()
      const newGuildData = data.map((member: GuildMemberResponse) => {
        const processed = {
          ...member,
          OnlineSince: member.OnlineStatus ? member.OnlineSince || currentTime.toISOString() : null,
          TimeOnline: member.OnlineStatus ? '00:00:00' : null,
        }
        return processed
      })

      const processedNames = new Set(currentGuildData.map(member => member.Name))
      const recentlyLoggedIn = newGuildData.filter((member: GuildMemberResponse) => {
        if (!member.OnlineStatus || !member.OnlineSince || processedNames.has(member.Name))
          return false
        const onlineSince = new Date(member.OnlineSince)
        const onlineTimeSeconds = (currentTime.getTime() - onlineSince.getTime()) / 1000
        const isRecent = onlineTimeSeconds <= 180 // 3 minutes in seconds

        if (isRecent) {
          console.debug('Found recently logged in member:', {
            name: member.Name,
            onlineSince: member.OnlineSince,
            timeOnline: onlineTimeSeconds,
          })
        }

        return isRecent
      })

      console.debug('Processed guild data:', {
        totalMembers: newGuildData.length,
        onlineMembers: newGuildData.filter(m => m.OnlineStatus).length,
        recentlyLoggedIn: recentlyLoggedIn.length,
      })

      return { newGuildData, recentlyLoggedIn }
    },
    [],
  )

  return {
    guildData,
    setGuildData,
    updateMemberData,
    processNewGuildData,
  }
}
