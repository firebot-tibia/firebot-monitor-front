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
 * Optimized hook for managing guild data with efficient updates and batching
 */
export const useGuildData = (): UseGuildDataReturn => {
  // Store guild data in state
  const [guildData, setGuildData] = useState<GuildMemberResponse[]>([])

  // Fast lookup references with refs to avoid re-renders
  const memberMapRef = useRef<MemberMap>(new Map())
  const pendingUpdatesRef = useRef<Set<string>>(new Set())
  const batchUpdateTimerRef = useRef<number | null>(null)
  const lastUpdateTimeRef = useRef<number>(Date.now())
  const processingRef = useRef(false)

  // Keep member map in sync with guild data
  useEffect(() => {
    memberMapRef.current = new Map(guildData.map(member => [member.Name, member]))
  }, [guildData])

  /**
   * Schedule a batched update of the guild data state with debouncing
   */
  const scheduleBatchUpdate = useCallback(() => {
    // Cancel any existing scheduled updates
    if (batchUpdateTimerRef.current !== null) {
      cancelAnimationFrame(batchUpdateTimerRef.current)
    }

    // Use requestAnimationFrame for optimal performance
    batchUpdateTimerRef.current = requestAnimationFrame(() => {
      // Only update if we have pending changes and not already processing
      if (pendingUpdatesRef.current.size > 0 && !processingRef.current) {
        processingRef.current = true

        // Create new array from current member map
        const newData = Array.from(memberMapRef.current.values())

        setGuildData(newData)
        pendingUpdatesRef.current.clear()
        lastUpdateTimeRef.current = Date.now()

        // Allow next update after this one completes
        setTimeout(() => {
          processingRef.current = false
        }, 0)
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
        // Check if update is necessary by comparing values
        let hasChanges = false
        for (const [key, value] of Object.entries(changes)) {
          if (existingMember[key as keyof GuildMemberResponse] !== value) {
            hasChanges = true
            break
          }
        }

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

      // Schedule the update but debounce it
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

      // Fast check: check if TimeOnline has changed
      if (newMember.TimeOnline !== existingMember.TimeOnline) return true

      // Fast check: check if Local has changed
      if (newMember.Local !== existingMember.Local) return true

      // Fast check: check if Kind has changed
      if (newMember.Kind !== existingMember.Kind) return true

      // Detailed check for date fields
      for (const key of ['OnlineSince', 'LastLogin']) {
        const typedKey = key as keyof GuildMemberResponse
        const newValue = newMember[typedKey] as string
        const existingValue = existingMember[typedKey] as string

        if (!newValue && !existingValue) continue
        if (!newValue || !existingValue) return true

        if (new Date(newValue).getTime() !== new Date(existingValue).getTime()) {
          return true
        }
      }

      return false
    },
    [],
  )

  /**
   * Process a complete new guild data set
   * @returns true if data was processed successfully
   */
  const processNewGuildData = useCallback(
    (data: unknown): boolean => {
      // Cancel any pending batch updates
      if (batchUpdateTimerRef.current !== null) {
        cancelAnimationFrame(batchUpdateTimerRef.current)
        batchUpdateTimerRef.current = null
      }

      // Validate input
      if (!Array.isArray(data) || data.length === 0) {
        console.warn('[Guild Data] Invalid or empty data format')
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
        const newMap = new Map(validMembers.map(member => [member.Name, member]))
        memberMapRef.current = newMap
        setGuildData(validMembers)
        lastUpdateTimeRef.current = Date.now()
        pendingUpdatesRef.current.clear()
        return true
      }

      // Check if we actually have changes (optimize for no changes case)
      const currentMap = memberMapRef.current
      const currentSize = currentMap.size

      // Fast check: different number of members
      if (currentSize !== validMembers.length) {
        // Update the member map and state
        const newMap = new Map(validMembers.map(member => [member.Name, member]))
        memberMapRef.current = newMap
        setGuildData(validMembers)
        lastUpdateTimeRef.current = Date.now()
        pendingUpdatesRef.current.clear()
        return true
      }

      // Detailed check: compare each member's data
      let hasChanges = false
      for (const member of validMembers) {
        const existing = currentMap.get(member.Name)
        if (!existing || hasMemberChanged(member, existing)) {
          hasChanges = true
          currentMap.set(member.Name, member)
        }
      }

      // Only update state if we found changes
      if (hasChanges) {
        // Use rAF for better performance
        batchUpdateTimerRef.current = requestAnimationFrame(() => {
          const newArray = Array.from(currentMap.values())
          setGuildData(newArray)
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
