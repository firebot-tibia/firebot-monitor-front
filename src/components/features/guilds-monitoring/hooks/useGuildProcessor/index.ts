import { useCallback, useEffect, useRef } from 'react'

import type { AlertCondition } from '@/components/features/monitoring/types/alert.types'
import type { GuildMemberResponse } from '@/types/guild-member.response'

interface UseGuildProcessorProps {
  onGuildDataProcessed: (data: GuildMemberResponse[]) => void
  onGuildMemberAlert: (members: GuildMemberResponse[], alert: AlertCondition) => void
}

export const useGuildProcessor = ({
  onGuildDataProcessed,
  onGuildMemberAlert,
}: UseGuildProcessorProps) => {
  // Use refs to avoid unnecessary re-renders and improve performance
  const currentDataMapRef = useRef(new Map<string, GuildMemberResponse>())
  const processedDataRef = useRef(new Map<string, GuildMemberResponse>())
  const batchUpdateRef = useRef<number | null>(null)

  const processGuildData = useCallback(
    (data: GuildMemberResponse[], currentData: GuildMemberResponse[], alert?: AlertCondition) => {
      const currentTime = new Date()

      // Quick reference check
      if (data === currentData && currentDataMapRef.current.size > 0) {
        return { newGuildData: currentData, recentlyLoggedIn: [] }
      }

      // Update current data map if needed
      if (currentDataMapRef.current.size !== currentData.length) {
        currentDataMapRef.current = new Map(currentData.map(member => [member.Name, member]))
      }

      // Clear processed data map
      processedDataRef.current.clear()
      const recentlyLoggedIn: GuildMemberResponse[] = []

      // Single pass through data with minimal object creation
      for (let i = 0; i < data.length; i++) {
        const member = data[i]
        const existingMember = currentDataMapRef.current.get(member.Name)
        const wasOnline = existingMember?.OnlineStatus
        const hadOnlineSince = existingMember?.OnlineSince

        // Only create new object if needed
        if (
          !existingMember ||
          member.OnlineStatus !== wasOnline ||
          member.OnlineSince !== hadOnlineSince
        ) {
          const processedMember = {
            ...member,
            OnlineSince: member.OnlineStatus
              ? member.OnlineSince || hadOnlineSince || currentTime.toISOString()
              : null,
            TimeOnline: member.OnlineStatus ? existingMember?.TimeOnline || '00:00:00' : null,
            Kind: existingMember?.Kind || member.Kind || 'main',
            Local: existingMember?.Local || member.Local,
          }

          processedDataRef.current.set(member.Name, processedMember)

          // Check for recently logged in
          if (processedMember.OnlineStatus && (!wasOnline || !hadOnlineSince)) {
            const onlineSince = new Date(processedMember.OnlineSince || '')
            const onlineTimeSeconds = (currentTime.getTime() - onlineSince.getTime()) / 1000
            if (onlineTimeSeconds <= 180) {
              // 3 minutes in seconds
              recentlyLoggedIn.push(processedMember)
            }
          }
        } else {
          processedDataRef.current.set(member.Name, existingMember)
        }
      }

      // Only create new array if we have changes
      const hasChanges =
        processedDataRef.current.size !== currentData.length || recentlyLoggedIn.length > 0
      const finalData = hasChanges ? Array.from(processedDataRef.current.values()) : currentData

      if (hasChanges) {
        // Schedule batch update
        if (batchUpdateRef.current) {
          cancelAnimationFrame(batchUpdateRef.current)
        }

        batchUpdateRef.current = requestAnimationFrame(() => {
          console.log('Processed guild data:', {
            inputCount: data.length,
            outputCount: finalData.length,
            recentlyLoggedIn: recentlyLoggedIn.length,
            uniqueMembers: processedDataRef.current.size,
            hasChanges,
          })

          onGuildDataProcessed(finalData)

          if (alert && recentlyLoggedIn.length > 0) {
            onGuildMemberAlert(recentlyLoggedIn, alert)
          }
        })
      }

      return { newGuildData: finalData, recentlyLoggedIn }
    },
    [onGuildDataProcessed, onGuildMemberAlert],
  )

  // Cleanup
  useEffect(() => {
    return () => {
      if (batchUpdateRef.current) {
        cancelAnimationFrame(batchUpdateRef.current)
      }
    }
  }, [])

  const processGuildChanges = useCallback(
    (changes: Record<string, any>, currentData: GuildMemberResponse[], alert?: AlertCondition) => {
      const updatedData = [...currentData]
      const loggedInMembers: GuildMemberResponse[] = []

      Object.entries(changes).forEach(([name, change]) => {
        const memberIndex = updatedData.findIndex(m => m.Name === name)
        if (memberIndex === -1) return

        const member = updatedData[memberIndex]
        const wasOffline = !member.OnlineStatus
        const isNowOnline = change.OnlineStatus

        if (wasOffline && isNowOnline) {
          const updatedMember = { ...member, ...change }
          loggedInMembers.push(updatedMember)
          updatedData[memberIndex] = updatedMember
        } else {
          updatedData[memberIndex] = { ...member, ...change }
        }
      })

      // Create a new array to force state update
      const finalData = [...updatedData]
      console.log('Processed guild changes:', {
        changesCount: Object.keys(changes).length,
        updatedCount: finalData.length,
        loggedInCount: loggedInMembers.length,
      })

      onGuildDataProcessed(finalData)

      if (alert && loggedInMembers.length > 0) {
        onGuildMemberAlert(loggedInMembers, alert)
      }

      return { updatedData: finalData, loggedInMembers }
    },
    [onGuildDataProcessed, onGuildMemberAlert],
  )

  return {
    processGuildData,
    processGuildChanges,
  }
}
