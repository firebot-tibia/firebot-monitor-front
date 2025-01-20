import { useEffect, useState, useCallback, useRef } from 'react'

import { fixedTypes } from '@/constants/types'
import type { GuildMemberResponse } from '@/types/guild-member.response'

const globalTypesSet = new Set<string>(fixedTypes)

export const useCharacterTypesView = (guildData: GuildMemberResponse[]) => {
  const [types, setTypes] = useState<string[]>(Array.from(globalTypesSet))
  const previousTypesRef = useRef<string[]>([])

  const areArraysEqual = (arr1: string[], arr2: string[]) => {
    if (arr1.length !== arr2.length) return false
    return arr1.every((item, index) => item === arr2[index])
  }

  const updateTypes = useCallback(() => {
    if (!Array.isArray(guildData) || guildData.length === 0) return

    guildData.forEach(member => {
      if (member.Kind && member.Kind.trim() !== '') {
        globalTypesSet.add(member.Kind)
      }
    })

    const allTypes = Array.from(globalTypesSet).sort()

    if (!areArraysEqual(allTypes, previousTypesRef.current)) {
      previousTypesRef.current = allTypes
      setTypes(allTypes)
    }
  }, [guildData])

  useEffect(() => {
    updateTypes()
  }, [updateTypes])

  return types
}
