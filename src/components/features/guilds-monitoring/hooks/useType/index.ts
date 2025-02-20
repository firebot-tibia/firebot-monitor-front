import { useEffect, useState, useCallback, useRef } from 'react'

import { fixedTypes } from '@/common/constants/types'
import type { GuildMemberResponse } from '@/common/types/guild-member.response'

const globalTypesSet = new Set<string>(fixedTypes)

export const useCharacterTypesView = (guildData: GuildMemberResponse[]) => {
  const [types, setTypes] = useState<string[]>(Array.from(globalTypesSet))
  const previousDataRef = useRef<GuildMemberResponse[]>([])
  const previousTypesRef = useRef<string[]>([])

  const areArraysEqual = (arr1: string[], arr2: string[]) => {
    if (arr1.length !== arr2.length) return false
    return arr1.every((item, index) => item === arr2[index])
  }

  const updateTypes = useCallback(() => {
    if (!Array.isArray(guildData) || guildData.length === 0) {
      const baseTypes = Array.from(fixedTypes).sort()
      if (!areArraysEqual(baseTypes, previousTypesRef.current)) {
        previousTypesRef.current = baseTypes
        setTypes(baseTypes)
      }
      return
    }

    if (
      areArraysEqual(
        guildData.map(d => d.Kind),
        previousDataRef.current.map(d => d.Kind),
      )
    ) {
      return
    }

    globalTypesSet.clear()
    fixedTypes.forEach(type => globalTypesSet.add(type))

    guildData.forEach(member => {
      if (member.Kind && member.Kind.trim() !== '') {
        globalTypesSet.add(member.Kind)
      }
    })

    const allTypes = Array.from(globalTypesSet).sort()

    if (!areArraysEqual(allTypes, previousTypesRef.current)) {
      previousTypesRef.current = allTypes
      previousDataRef.current = guildData
      setTypes(allTypes)
    }
  }, [guildData])

  useEffect(() => {
    updateTypes()
  }, [updateTypes])

  return types
}
