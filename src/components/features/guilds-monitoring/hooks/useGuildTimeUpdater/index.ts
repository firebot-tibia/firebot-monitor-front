import { useEffect } from 'react'

import type { GuildMemberResponse } from '../../../../../common/types/guild-member.response'
import { formatTimeOnline } from '../../../../../common/utils/format-time-online'

interface UseGuildTimeUpdaterProps {
  setGuildData: React.Dispatch<React.SetStateAction<GuildMemberResponse[]>>
}

export const useGuildTimeUpdater = ({ setGuildData }: UseGuildTimeUpdaterProps) => {
  useEffect(() => {
    const interval = setInterval(() => {
      setGuildData(prevData =>
        prevData.map(member => {
          if (member.OnlineStatus && member.OnlineSince) {
            const onlineSince = new Date(member.OnlineSince)
            const now = new Date()
            const diffInMinutes = (now.getTime() - onlineSince.getTime()) / 60000
            return { ...member, TimeOnline: formatTimeOnline(diffInMinutes) }
          }
          return member
        }),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [setGuildData])
}
