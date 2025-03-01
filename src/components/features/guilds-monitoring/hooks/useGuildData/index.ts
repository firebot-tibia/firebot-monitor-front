import { useCallback, useEffect, useRef, useState } from 'react'

import type { GuildMemberResponse } from '../../../../../common/types/guild-member.response'

interface UseGuildDataReturn {
  guildData: GuildMemberResponse[]
  setGuildData: (
    value: GuildMemberResponse[] | ((prev: GuildMemberResponse[]) => GuildMemberResponse[]),
  ) => void
  updateMemberData: (member: GuildMemberResponse, changes: Partial<GuildMemberResponse>) => void
  processNewGuildData: (data: unknown) => boolean
  getMemberByName: (name: string) => GuildMemberResponse | undefined
}

/**
 * Hook for managing guild data with optimized updates and batching
 */
export const useGuildData = (): UseGuildDataReturn => {
  // Store guild data in state
  const [guildData, setGuildData] = useState<GuildMemberResponse[]>([])

  // Fast lookup references
  const memberMapRef = useRef<Map<string, GuildMemberResponse>>(new Map())
  const pendingUpdatesRef = useRef<Set<string>>(new Set())
  const batchUpdateRef = useRef<number | null>(null)
  const lastUpdateRef = useRef<number>(Date.now())

  // Keep member map in sync with guild data
  useEffect(() => {
    memberMapRef.current = new Map(guildData.map(member => [member.Name, member]))
  }, [guildData])

  /**
   * Get member by name with O(1) lookup
   */
  const getMemberByName = useCallback((name: string): GuildMemberResponse | undefined => {
    return memberMapRef.current.get(name)
  }, [])

  /**
   * Updates a single member's data with batching for performance
   */
  const updateMemberData = useCallback(
    (member: GuildMemberResponse, changes: Partial<GuildMemberResponse>) => {
      // Validate input
      if (!member?.Name) return

      const memberName = member.Name
      const currentMap = memberMapRef.current
      const existingMember = currentMap.get(memberName)

      // Add to pending updates
      pendingUpdatesRef.current.add(memberName)

      if (!existingMember) {
        // Add new member with changes
        currentMap.set(memberName, { ...member, ...changes })
      } else {
        // Check if update is necessary
        const hasChanges = Object.entries(changes).some(
          ([key, value]) => existingMember[key as keyof GuildMemberResponse] !== value,
        )

        if (hasChanges) {
          // Update existing member
          currentMap.set(memberName, { ...existingMember, ...changes })
          lastUpdateRef.current = Date.now()
        } else {
          // No changes needed
          pendingUpdatesRef.current.delete(memberName)
          return
        }
      }

      // Batch updates for better performance
      if (batchUpdateRef.current) {
        cancelAnimationFrame(batchUpdateRef.current)
      }

      batchUpdateRef.current = requestAnimationFrame(() => {
        // Only update if we have pending changes
        if (pendingUpdatesRef.current.size > 0) {
          const newData = Array.from(currentMap.values())
          setGuildData(newData)
          pendingUpdatesRef.current.clear()
        }
        batchUpdateRef.current = null
      })
    },
    [],
  )

  /**
   * Process a complete new guild data set
   * @returns true if data was processed successfully
   */
  const processNewGuildData = useCallback((data: unknown): boolean => {
    console.log('[Guild Data] Processing new guild data:', {
      dataType: typeof data,
      isArray: Array.isArray(data),
      length: Array.isArray(data) ? data.length : 0,
      sample: Array.isArray(data) ? data[0] : null,
    })
    // Validate input
    if (!Array.isArray(data)) {
      console.warn('[Guild Data] Invalid data format:', data)
      return false
    }

    // Cancel any pending batch updates
    if (batchUpdateRef.current) {
      cancelAnimationFrame(batchUpdateRef.current)
      batchUpdateRef.current = null
    }

    if (data.length === 0) {
      return false
    }

    // Filter valid members
    const validMembers = data.filter((member): member is GuildMemberResponse => {
      if (!member?.Name || typeof member.Name !== 'string') {
        return false
      }
      return true
    })

    if (validMembers.length === 0) {
      return false
    }

    try {
      // Cancel any pending updates
      if (batchUpdateRef.current) {
        cancelAnimationFrame(batchUpdateRef.current)
        batchUpdateRef.current = null
      }

      // Update the member map directly
      const newMap = new Map(validMembers.map(member => [member.Name, member]))
      memberMapRef.current = newMap

      // Update state
      setGuildData(validMembers)
      lastUpdateRef.current = Date.now()
      pendingUpdatesRef.current.clear()

      return true
    } catch (error) {
      // Retry once on error
      setTimeout(() => {
        setGuildData(validMembers)
      }, 0)

      return false
    }
  }, [])

  // Clean up any pending operations on unmount
  useEffect(() => {
    return () => {
      if (batchUpdateRef.current) {
        cancelAnimationFrame(batchUpdateRef.current)
      }
    }
  }, [])

  return {
    guildData,
    setGuildData,
    updateMemberData,
    processNewGuildData,
    getMemberByName,
  }
}
