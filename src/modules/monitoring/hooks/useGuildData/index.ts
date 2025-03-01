import { useCallback, useEffect, useRef, useState } from 'react'

import type { GuildMemberResponse } from '../../../../core/types/guild-member.response'

interface UseGuildDataReturn {
  guildData: GuildMemberResponse[]
  setGuildData: (
    value: GuildMemberResponse[] | ((prev: GuildMemberResponse[]) => GuildMemberResponse[]),
  ) => void
  updateMemberData: (member: GuildMemberResponse, changes: Partial<GuildMemberResponse>) => void
  processNewGuildData: (data: unknown) => boolean
  getMemberByName: (name: string) => GuildMemberResponse | undefined
}

type MemberMap = Map<string, GuildMemberResponse>

/**
 * Hook for managing guild data with optimized updates and batching
 */
export const useGuildData = (): UseGuildDataReturn => {
  // Store guild data in state
  const [guildData, setGuildData] = useState<GuildMemberResponse[]>([])

  // Fast lookup references
  const memberMapRef = useRef<MemberMap>(new Map())
  const pendingUpdatesRef = useRef<Set<string>>(new Set())
  const batchUpdateTimerRef = useRef<number | null>(null)
  const lastUpdateTimeRef = useRef<number>(Date.now())

  // Keep member map in sync with guild data
  useEffect(() => {
    memberMapRef.current = new Map(guildData.map(member => [member.Name, member]))
  }, [guildData])

  /**
   * Helper function to schedule a batched update of the guild data state
   */
  const scheduleBatchUpdate = useCallback(() => {
    // Cancel any existing scheduled updates
    if (batchUpdateTimerRef.current !== null) {
      cancelAnimationFrame(batchUpdateTimerRef.current)
    }

    batchUpdateTimerRef.current = requestAnimationFrame(() => {
      // Only update if we have pending changes
      if (pendingUpdatesRef.current.size > 0) {
        const newData = Array.from(memberMapRef.current.values())
        setGuildData(newData)
        pendingUpdatesRef.current.clear()
      }
      batchUpdateTimerRef.current = null
    })
  }, [])

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
          lastUpdateTimeRef.current = Date.now()
        } else {
          // No changes needed
          pendingUpdatesRef.current.delete(memberName)
          return
        }
      }

      scheduleBatchUpdate()
    },
    [scheduleBatchUpdate],
  )

  /**
   * Determines if a value is a valid guild member
   */
  const isValidMember = useCallback((member: unknown): member is GuildMemberResponse => {
    return (
      !!member &&
      typeof member === 'object' &&
      'Name' in member &&
      typeof (member as GuildMemberResponse).Name === 'string'
    )
  }, [])

  /**
   * Checks if a member has changed compared to existing data
   */
  const hasMemberChanged = useCallback(
    (newMember: GuildMemberResponse, existingMember: GuildMemberResponse): boolean => {
      // Fast check: always update if online status changes
      if (newMember.OnlineStatus !== existingMember.OnlineStatus) return true

      return Object.keys(newMember).some(key => {
        const typedKey = key as keyof GuildMemberResponse
        const newValue = newMember[typedKey]
        const existingValue = existingMember[typedKey]

        // Handle special cases for date fields
        if (key === 'OnlineSince' || key === 'LastLogin' || key === 'Login') {
          return (
            new Date(newValue as string).getTime() !== new Date(existingValue as string).getTime()
          )
        }

        return newValue !== existingValue
      })
    },
    [],
  )

  /**
   * Process a complete new guild data set
   * @returns true if data was processed successfully
   */
  const processNewGuildData = useCallback(
    (data: unknown): boolean => {
      console.log('[Guild Data] Processing new guild data:', {
        dataType: typeof data,
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : 0,
        sample: Array.isArray(data) ? data[0] : null,
      })

      // Cancel any pending batch updates
      if (batchUpdateTimerRef.current !== null) {
        cancelAnimationFrame(batchUpdateTimerRef.current)
        batchUpdateTimerRef.current = null
      }

      // Validate input
      if (!Array.isArray(data) || data.length === 0) {
        console.warn('[Guild Data] Invalid or empty data format:', data)
        return false
      }

      // Filter valid members
      const validMembers = data.filter(isValidMember)

      if (validMembers.length === 0) {
        console.warn('[Guild Data] No valid members found in data')
        return false
      }

      // Fast path: first load - update immediately
      if (memberMapRef.current.size === 0) {
        console.log('[Guild Data] First load, updating immediately')
        const newMap = new Map(validMembers.map(member => [member.Name, member]))
        memberMapRef.current = newMap
        setGuildData(validMembers)
        lastUpdateTimeRef.current = Date.now()
        pendingUpdatesRef.current.clear()
        return true
      }

      // Check if we actually have changes
      const currentMap = memberMapRef.current
      const currentSize = currentMap.size

      // Fast check: different number of members
      if (currentSize !== validMembers.length) {
        console.log('[Guild Data] Member count changed, updating...', {
          current: currentSize,
          new: validMembers.length,
        })

        // Update the member map and state
        const newMap = new Map(validMembers.map(member => [member.Name, member]))
        memberMapRef.current = newMap
        setGuildData(validMembers)
        lastUpdateTimeRef.current = Date.now()
        pendingUpdatesRef.current.clear()
        return true
      }

      // Detailed check: compare each member's data
      const hasChanges = validMembers.some(member => {
        const existing = currentMap.get(member.Name)
        if (!existing) return true
        return hasMemberChanged(member, existing)
      })

      console.log('[Guild Data] Change detection:', {
        memberCount: validMembers.length,
        hasChanges,
        sample: validMembers[0],
      })

      if (hasChanges) {
        // Schedule update using requestAnimationFrame
        batchUpdateTimerRef.current = requestAnimationFrame(() => {
          // Update the member map directly
          const newMap = new Map(validMembers.map(member => [member.Name, member]))
          memberMapRef.current = newMap

          // Update state
          setGuildData(validMembers)
          lastUpdateTimeRef.current = Date.now()
          pendingUpdatesRef.current.clear()
          batchUpdateTimerRef.current = null
        })
      }

      return hasChanges
    },
    [isValidMember, hasMemberChanged],
  )

  // Clean up any pending operations on unmount
  useEffect(() => {
    return () => {
      if (batchUpdateTimerRef.current !== null) {
        cancelAnimationFrame(batchUpdateTimerRef.current)
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
