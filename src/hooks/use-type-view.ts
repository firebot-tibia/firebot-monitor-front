import { useEffect, useState } from 'react'

import { fixedTypes } from '../constants/types'
import type { GuildMemberResponse } from '../types/guild-member.interface'

export const useCharacterTypesView = (guildData: GuildMemberResponse[]) => {
  const [types, setTypes] = useState<string[]>(fixedTypes)

  useEffect(() => {
    if (Array.isArray(guildData) && guildData.length > 0) {
      const allTypes = guildData.map(member => member.Kind)
      const uniqueTypes = Array.from(new Set(allTypes.filter(type => type && type.trim() !== '')))
      const combinedTypes = Array.from(new Set([...fixedTypes, ...uniqueTypes]))

      setTypes(combinedTypes)
    }
  }, [guildData])

  return types
}
