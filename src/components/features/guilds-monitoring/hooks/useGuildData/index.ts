import { useCallback, useEffect, useRef, useState } from 'react'

import type { GuildMemberResponse } from '../../../../../types/guild-member.response'

interface UseGuildDataReturn {
  guildData: GuildMemberResponse[]
  setGuildData: (
    value: GuildMemberResponse[] | ((prev: GuildMemberResponse[]) => GuildMemberResponse[]),
  ) => void
  updateMemberData: (member: GuildMemberResponse, changes: Partial<GuildMemberResponse>) => void
  processNewGuildData: (data: GuildMemberResponse[]) => void
}

export const useGuildData = (): UseGuildDataReturn => {
  // Use ref for current data to avoid re-renders
  const guildDataRef = useRef<GuildMemberResponse[]>([])
  const [guildData, setGuildData] = useState<GuildMemberResponse[]>(() => {
    console.debug('Initializing guild data state')
    return []
  })

  // Use Map for O(1) lookups
  const memberMapRef = useRef(new Map<string, GuildMemberResponse>())

  // Batch updates using RAF
  const batchUpdateRef = useRef<number | null>(null)

  // Update member map when guild data changes
  useEffect(() => {
    memberMapRef.current = new Map(guildData.map(member => [member.Name, member]))
    guildDataRef.current = guildData
  }, [guildData])

  const updateMemberData = useCallback(
    (member: GuildMemberResponse, changes: Partial<GuildMemberResponse>) => {
      const currentMap = memberMapRef.current
      const memberName = member.Name
      const existingMember = currentMap.get(memberName)

      if (!existingMember) {
        currentMap.set(memberName, { ...member, ...changes })
      } else {
        currentMap.set(memberName, { ...existingMember, ...changes })
      }

      // Schedule batch update
      if (batchUpdateRef.current) {
        cancelAnimationFrame(batchUpdateRef.current)
      }

      batchUpdateRef.current = requestAnimationFrame(() => {
        setGuildData(Array.from(currentMap.values()))
      })
    },
    [],
  )

  const processNewGuildData = useCallback((data: GuildMemberResponse[]) => {
    if (!Array.isArray(data) || data.length === 0) return

    // Fast path - check if data is identical
    if (data === guildDataRef.current) return

    // Use Map for faster processing
    const newDataMap = new Map(data.map(member => [member.Name, member]))

    // Quick length and content check
    if (newDataMap.size === memberMapRef.current.size) {
      let hasChanges = false
      // Use Array.from for ES5 compatibility
      const entries = Array.from(newDataMap.keys())
      for (let i = 0; i < entries.length; i++) {
        const name = entries[i]
        const member = newDataMap.get(name)
        const existing = memberMapRef.current.get(name)
        if (!existing || JSON.stringify(existing) !== JSON.stringify(member)) {
          hasChanges = true
          break
        }
      }
      if (!hasChanges) return
    }

    // Schedule batch update
    if (batchUpdateRef.current) {
      cancelAnimationFrame(batchUpdateRef.current)
    }

    batchUpdateRef.current = requestAnimationFrame(() => {
      console.log('Processing new guild data:', {
        newDataCount: data.length,
        currentDataCount: guildDataRef.current.length,
        hasChanges: true,
      })
      setGuildData(data)
    })
  }, [])

  return {
    guildData,
    setGuildData,
    updateMemberData,
    processNewGuildData,
  }
}
