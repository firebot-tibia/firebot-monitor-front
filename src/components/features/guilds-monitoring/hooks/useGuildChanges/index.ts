import { useCallback, useEffect, useRef } from 'react'

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
  // Use refs to avoid unnecessary allocations
  const memberMapRef = useRef(new Map<string, GuildMemberResponse>())
  const loggedInChangesRef = useRef(new Map<string, GuildMemberResponse>())
  const batchUpdateRef = useRef<number | null>(null)

  const processGuildChanges = useCallback(
    (changes: Record<string, any>, currentData: GuildMemberResponse[]) => {
      // Quick reference check
      if (Object.keys(changes).length === 0) {
        return { updatedData: currentData, loggedInMembers: [] }
      }

      // Update member map if needed
      if (memberMapRef.current.size !== currentData.length) {
        memberMapRef.current = new Map(currentData.map(member => [member.Name, member]))
      }

      // Clear logged in changes
      loggedInChangesRef.current.clear()
      let hasChanges = false

      // Process all changes in a single pass
      const entries = Object.entries(changes)
      for (let i = 0; i < entries.length; i++) {
        const [name, change] = entries[i]
        const currentMember = memberMapRef.current.get(name)
        if (!currentMember) continue

        const changeType = change.ChangeType
        const changeMember = change.Member || {}

        // Only create new object if needed
        if (changeType === 'logged-in') {
          hasChanges = true
          const updatedMember = {
            ...currentMember,
            ...changeMember,
            OnlineStatus: true,
            OnlineSince: new Date().toISOString(),
            TimeOnline: '00:00:00',
          }
          memberMapRef.current.set(name, updatedMember)
          loggedInChangesRef.current.set(name, updatedMember)
        } else if (changeType === 'logged-out') {
          hasChanges = true
          const updatedMember = {
            ...currentMember,
            ...changeMember,
            OnlineStatus: false,
            OnlineSince: null,
            TimeOnline: null,
          }
          memberMapRef.current.set(name, updatedMember)
          loggedInChangesRef.current.delete(name)
        } else if (Object.keys(changeMember).length > 0) {
          hasChanges = true
          memberMapRef.current.set(name, { ...currentMember, ...changeMember })
        }
      }

      // Only create new arrays if we have changes
      return {
        updatedData: hasChanges ? Array.from(memberMapRef.current.values()) : currentData,
        loggedInMembers: Array.from(loggedInChangesRef.current.values()),
      }
    },
    [],
  )

  // Cleanup
  useEffect(() => {
    return () => {
      if (batchUpdateRef.current) {
        cancelAnimationFrame(batchUpdateRef.current)
      }
    }
  }, [])

  return { processGuildChanges }
}
