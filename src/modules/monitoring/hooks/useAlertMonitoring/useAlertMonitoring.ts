import { useRef, useMemo, useCallback, useEffect } from 'react'

import type { GuildMemberResponse } from '@/core/types/guild-member.response'

import { useAlertMonitoringStore } from '../../stores/alert-monitoring-store'
import { useAlertSettingsStore } from '../../stores/alert-settings-store'
import { useSoundStore } from '../../stores/sounds-permission-store'
import type { AlertCondition } from '../../types/alert.types'

interface RecentLogin {
  character: GuildMemberResponse
  timestamp: Date
}

interface AlertCheckResult {
  reachedThreshold: boolean
  alert?: AlertCondition
  triggeredMembers: GuildMemberResponse[]
}

interface UseAlertMonitoringReturn {
  checkAndTriggerAlerts: (newLogins: GuildMemberResponse[]) => AlertCheckResult
  getRecentLogins: () => RecentLogin[]
  clearAlerts: () => void
  getPendingAlerts: () => Map<string, { alert: AlertCondition; members: GuildMemberResponse[] }>
}

export const useAlertMonitoring = (): UseAlertMonitoringReturn => {
  // Get stores
  const { alerts } = useAlertSettingsStore()
  const { alertLogins, lastAlertTimes, setAlertLogins, setLastAlertTime, clearAlertLogins } =
    useAlertMonitoringStore()
  const { playSound } = useSoundStore()

  // Track timeouts for cleanup
  const alertTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
  // Track processed members to avoid duplicates
  const processedMembersRef = useRef<Map<string, number>>(new Map())
  // Track pending alerts for UI feedback
  const pendingAlertsRef = useRef<
    Map<
      string,
      {
        alert: AlertCondition
        members: GuildMemberResponse[]
      }
    >
  >(new Map())

  // Constants
  const COOLDOWN_MS = 30000 // 30 seconds
  const MAX_LOGIN_AGE_MS = 3 * 60 * 1000 // 3 minutes

  // Filter out inactive alerts on initialization
  const activeAlerts = useMemo(() => alerts.filter((a: { enabled: any }) => a.enabled), [alerts])

  /**
   * Clear all active timeouts and pending alerts
   */
  const clearAlerts = useCallback(() => {
    // Clear all timeouts
    alertTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    alertTimeoutsRef.current.clear()

    // Clear processed members
    processedMembersRef.current.clear()

    // Clear pending alerts
    pendingAlertsRef.current.clear()

    // Clear store data
    activeAlerts.forEach((alert: { id: any }) => {
      clearAlertLogins(alert.id)
    })
  }, [activeAlerts, clearAlertLogins])

  /**
   * Get current pending alerts
   */
  const getPendingAlerts = useCallback(() => {
    return pendingAlertsRef.current
  }, [])

  /**
   * Get recent logins across all alerts
   */
  const getRecentLogins = useCallback((): RecentLogin[] => {
    const currentTime = Date.now()
    const uniqueLogins = new Map<string, RecentLogin>()

    // Collect valid logins from all alerts
    alertLogins.forEach((logins: any[]) => {
      logins.forEach(
        (login: { timestamp: string | number | Date; character: GuildMemberResponse }) => {
          const loginTime = new Date(login.timestamp)
          const onlineTime = currentTime - loginTime.getTime()

          // Only include logins that are within the recent window
          if (onlineTime <= MAX_LOGIN_AGE_MS) {
            const existing = uniqueLogins.get(login.character.Name)
            if (!existing || loginTime > new Date(existing.timestamp)) {
              uniqueLogins.set(login.character.Name, {
                character: {
                  ...login.character,
                  OnlineStatus: true,
                  TimeOnline: null,
                  OnlineSince: null,
                  LastLogin: new Date().toISOString(),
                },
                timestamp: loginTime,
              })
            }
          }
        },
      )
    })

    // Sort by most recent first
    return Array.from(uniqueLogins.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    )
  }, [alertLogins, MAX_LOGIN_AGE_MS])

  /**
   * Check if member should be considered for alerts
   */
  const isRecentLogin = useCallback(
    (member: GuildMemberResponse): boolean => {
      if (!member.OnlineSince || !member.OnlineStatus) return false

      const onlineSince = new Date(member.OnlineSince)
      const onlineTime = Date.now() - onlineSince.getTime()

      // Check if this is a previously processed member
      const lastProcessed = processedMembersRef.current.get(member.Name)
      if (lastProcessed && Date.now() - lastProcessed < COOLDOWN_MS) {
        return false
      }

      return onlineTime <= MAX_LOGIN_AGE_MS
    },
    [COOLDOWN_MS, MAX_LOGIN_AGE_MS],
  )

  /**
   * Main function to check and trigger alerts
   */
  const checkAndTriggerAlerts = useCallback(
    (newLogins: GuildMemberResponse[]): AlertCheckResult => {
      if (!activeAlerts.length) {
        return { reachedThreshold: false, triggeredMembers: [] }
      }

      // Filter valid members that have recently logged in
      const recentMembers = newLogins.filter(isRecentLogin)

      if (recentMembers.length === 0) {
        return { reachedThreshold: false, triggeredMembers: [] }
      }

      // Mark these members as processed to avoid duplicate alerts
      recentMembers.forEach(member => {
        processedMembersRef.current.set(member.Name, Date.now())
      })

      // Start with empty result
      const result: AlertCheckResult = {
        reachedThreshold: false,
        triggeredMembers: [],
      }

      // Check each alert
      for (const alert of activeAlerts) {
        const alertId = alert.id
        const currentTime = Date.now()
        const timeWindow = alert.timeRange * 60 * 1000

        // Get existing valid logins for this alert
        const existingLogins = (alertLogins.get(alertId) || [])
          .map((login: { character: any; timestamp: string | number | Date }) => ({
            character: login.character,
            timestamp: new Date(login.timestamp),
          }))
          .filter((login: { timestamp: { getTime: () => number } }) => {
            const age = currentTime - login.timestamp.getTime()
            return age <= timeWindow
          })

        // Add new logins
        const updatedLogins = [...existingLogins]

        recentMembers.forEach(member => {
          // Only add if not already present
          const existingIndex = updatedLogins.findIndex(l => l.character.Name === member.Name)

          if (existingIndex === -1) {
            updatedLogins.push({
              character: member,
              timestamp: new Date(member.OnlineSince || Date.now()),
            })
          }
        })

        // Update store with latest logins
        setAlertLogins(alertId, updatedLogins)

        // Check if threshold is met
        if (updatedLogins.length >= alert.threshold) {
          // Check cooldown
          const lastAlertTime = lastAlertTimes[alertId] || 0
          const timeSinceLastAlert = currentTime - lastAlertTime

          if (timeSinceLastAlert >= COOLDOWN_MS || !lastAlertTime) {
            // Clear any existing timeout
            if (alertTimeoutsRef.current.has(alertId)) {
              clearTimeout(alertTimeoutsRef.current.get(alertId)!)
            }

            // Set expiration timeout
            const timeoutId = setTimeout(() => {
              clearAlertLogins(alertId)
              pendingAlertsRef.current.delete(alertId)
              alertTimeoutsRef.current.delete(alertId)
            }, timeWindow)

            alertTimeoutsRef.current.set(alertId, timeoutId)

            // Record this alert
            setLastAlertTime(alertId, currentTime)

            // Store members for UI
            pendingAlertsRef.current.set(alertId, {
              alert,
              members: updatedLogins.map(login => login.character),
            })

            // Play sound
            playSound(alert.sound)

            // Mark as triggered
            result.reachedThreshold = true
            result.alert = alert
            result.triggeredMembers = updatedLogins.map(login => login.character)
          }
        }
      }

      return result
    },
    [
      activeAlerts,
      alertLogins,
      isRecentLogin,
      lastAlertTimes,
      setAlertLogins,
      setLastAlertTime,
      clearAlertLogins,
      playSound,
      COOLDOWN_MS,
    ],
  )

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      alertTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      alertTimeoutsRef.current.clear()
    }
  }, [])

  return {
    checkAndTriggerAlerts,
    getRecentLogins,
    clearAlerts,
    getPendingAlerts,
  }
}
