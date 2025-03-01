import { useCallback, useMemo } from 'react'

import type { GuildMemberResponse } from '@/common/types/guild-member.response'
import type { AlertCondition } from '@/components/features/monitoring/types/alert.types'

/**
 * Compatible return type matching the existing implementation
 */
export interface ProcessGuildDataResult {
  newGuildData: GuildMemberResponse[]
  recentlyLoggedIn: GuildMemberResponse[]
}

/**
 * Compatible return type matching the existing implementation
 */
export interface ProcessGuildChangesResult {
  updatedData: GuildMemberResponse[]
  loggedInMembers: GuildMemberResponse[]
}

/**
 * Hook props - maintains backward compatibility
 */
interface UseGuildProcessorProps {
  onGuildDataProcessed: (data: GuildMemberResponse[]) => void
  onGuildMemberAlert: (members: GuildMemberResponse[], alert: AlertCondition) => void
  recentLoginThreshold?: number // Time window in seconds to consider a login as "recent"
}

/**
 * Improved guild processor hook with perfect backward compatibility
 */
export const useGuildProcessor = ({
  onGuildDataProcessed,
  onGuildMemberAlert,
  recentLoginThreshold = 180, // Default 3 minutes in seconds
}: UseGuildProcessorProps) => {
  /**
   * Calculate time window for recent logins
   */
  const recentLoginWindow = useMemo(
    () => recentLoginThreshold * 1000, // Convert to milliseconds
    [recentLoginThreshold],
  )

  /**
   * Process complete guild data snapshot
   * - Updates online status information
   * - Identifies recently logged in members
   * - Return format matches the existing implementation
   */
  const processGuildData = useCallback(
    (data: GuildMemberResponse[], currentData: GuildMemberResponse[]): ProcessGuildDataResult => {
      console.log('[Guild Processor Debug] Processing guild data:', {
        newDataCount: data?.length,
        currentDataCount: currentData?.length,
        isNewDataArray: Array.isArray(data),
        isCurrentDataArray: Array.isArray(currentData),
        sampleNewData: data?.[0],
        sampleCurrentData: currentData?.[0],
      })
      if (!Array.isArray(data) || data.length === 0) {
        console.warn('[Guild Processor Debug] Invalid or empty data')
        return { newGuildData: currentData, recentlyLoggedIn: [] }
      }

      const currentTime = new Date()

      // Create lookup map of current members by name for quick access
      const currentMembersMap = new Map<string, GuildMemberResponse>()
      currentData.forEach(member => {
        currentMembersMap.set(member.Name, member)
      })

      // Process each member in the new data (optimized with Map lookups)
      const newGuildData = data.map((member: GuildMemberResponse) => {
        const currentMember = currentMembersMap.get(member.Name)

        return {
          ...member,
          // Preserve OnlineSince if already online, otherwise set new timestamp
          OnlineSince: member.OnlineStatus ? member.OnlineSince || currentTime.toISOString() : null,
          // Initialize or reset TimeOnline
          TimeOnline: member.OnlineStatus ? member.TimeOnline || '00:00:00' : null,
          // Preserve custom data from current state if it exists
          Kind: member.Kind || currentMember?.Kind || 'main',
          Local: member.Local || currentMember?.Local || '',
        }
      })

      // Find recently logged in members (optimized with Set for lookups)
      const processedNames = new Set(currentData.map(member => member.Name))
      const recentlyLoggedIn = newGuildData.filter((member: GuildMemberResponse) => {
        console.log('[Guild Processor Debug] Checking member for recent login:', {
          name: member.Name,
          onlineStatus: member.OnlineStatus,
          onlineSince: member.OnlineSince,
        })
        if (!member.OnlineStatus || !member.OnlineSince) return false

        // Check if member wasn't in the current data or was offline
        const currentMember = currentMembersMap.get(member.Name)
        const wasOffline = !currentMember?.OnlineStatus

        // Only count as "recently logged in" if they were offline before or are new
        if (!wasOffline && processedNames.has(member.Name)) return false

        // Check how long they've been online
        const onlineSince = new Date(member.OnlineSince)
        const onlineTimeMs = currentTime.getTime() - onlineSince.getTime()

        return onlineTimeMs <= recentLoginWindow
      })

      return {
        newGuildData,
        recentlyLoggedIn,
      }
    },
    [recentLoginWindow],
  )

  /**
   * Process incremental guild changes
   * - Updates existing members with changes
   * - Identifies members that have just logged in
   * - Return format matches the existing implementation
   */
  const processGuildChanges = useCallback(
    (
      changes: Record<string, any>,
      currentData: GuildMemberResponse[],
    ): ProcessGuildChangesResult => {
      if (!changes || Object.keys(changes).length === 0) {
        return { updatedData: currentData, loggedInMembers: [] }
      }

      const updatedData = [...currentData]
      const loggedInMembers: GuildMemberResponse[] = []

      // Process each change by name
      Object.entries(changes).forEach(([name, change]) => {
        // Handle different change formats
        const memberChange = change.Member || change
        const changeType = change.ChangeType || 'updated'

        // Skip invalid changes
        if (!memberChange || typeof memberChange !== 'object') return

        // Find the member in the current data
        const memberIndex = updatedData.findIndex(m => m.Name === name)

        if (memberIndex === -1) {
          // Member not found - create new if logging in
          if (changeType === 'logged-in') {
            const newMember = {
              ...memberChange,
              Name: name,
              OnlineStatus: true,
              OnlineSince: new Date().toISOString(),
              TimeOnline: '00:00:00',
            }
            updatedData.push(newMember)
            loggedInMembers.push(newMember)
          }
          return
        }

        // Get current member data
        const member = updatedData[memberIndex]
        const wasOffline = !member.OnlineStatus
        const isNowOnline =
          changeType === 'logged-in' ||
          (changeType === 'updated' && memberChange.OnlineStatus === true)

        // Track if member just logged in
        if (wasOffline && isNowOnline) {
          // Create the updated member
          const updatedMember = {
            ...member,
            ...memberChange,
            OnlineStatus: true,
            OnlineSince: new Date().toISOString(),
            TimeOnline: '00:00:00',
          }

          // Update in the data array
          updatedData[memberIndex] = updatedMember

          // Add to logged in members list
          loggedInMembers.push(updatedMember)
        } else {
          // Regular update
          updatedData[memberIndex] = {
            ...member,
            ...memberChange,
            // Force offline status for logged-out
            OnlineStatus:
              changeType === 'logged-out'
                ? false
                : memberChange.OnlineStatus !== undefined
                  ? memberChange.OnlineStatus
                  : member.OnlineStatus,
            // Clear online data if logged out
            OnlineSince: changeType === 'logged-out' ? null : member.OnlineSince,
            TimeOnline: changeType === 'logged-out' ? null : member.TimeOnline,
          }
        }
      })

      return { updatedData, loggedInMembers }
    },
    [],
  )

  return {
    processGuildData,
    processGuildChanges,
  }
}
