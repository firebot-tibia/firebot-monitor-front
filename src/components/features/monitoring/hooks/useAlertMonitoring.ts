import { useCallback, useRef } from 'react'

import { useAlertSettingsStore } from '@/components/features/monitoring/stores/alert-settings-store'
import type { AlertCondition } from '@/components/features/monitoring/types/alert.types'
import type { GuildMemberResponse } from '@/types/guild-member.response'

import { useAlertMonitoringStore } from '../stores/alert-monitoring-store'
import { useSoundStore } from '../stores/sounds-permission-store'

interface RecentLogin {
  character: GuildMemberResponse
  timestamp: Date
}

interface AlertCheckResult {
  reachedThreshold: boolean
  alert?: AlertCondition
}

interface UseAlertMonitoringReturn {
  checkAndTriggerAlerts: (newLogins: GuildMemberResponse[]) => AlertCheckResult
  getRecentLogins: () => RecentLogin[]
}

export const useAlertMonitoring = (): UseAlertMonitoringReturn => {
  const { alerts } = useAlertSettingsStore()
  const { alertLogins, lastAlertTimes, setAlertLogins, setLastAlertTime, clearAlertLogins } =
    useAlertMonitoringStore()
  const { playSound } = useSoundStore()

  const alertTimeoutsRef = useRef<NodeJS.Timeout[]>([])
  const COOLDOWN_MS = 30000
  const MAX_LOGIN_AGE_MS = 3 * 60 * 1000 // 3 minutes

  const checkAndTriggerAlerts = useCallback(
    (newLogins: GuildMemberResponse[]): AlertCheckResult => {
      const currentTime = new Date()
      const enabledAlerts = alerts.filter(a => a.enabled)

      // Filter out characters that have been online for more than 3 minutes
      const recentLogins = newLogins.filter(char => {
        if (!char.OnlineSince) return false
        const onlineSince = new Date(char.OnlineSince)
        const onlineTime = currentTime.getTime() - onlineSince.getTime()
        return onlineTime <= MAX_LOGIN_AGE_MS
      })

      if (recentLogins.length === 0) {
        return { reachedThreshold: false, alert: undefined }
      }

      for (const alert of enabledAlerts) {
        const alertId = alert.id.toString()
        const timeWindow = alert.timeRange * 60 * 1000

        // Get existing valid logins
        const storedLogins = alertLogins.get(alertId) || []
        const validLogins = storedLogins
          .map(login => ({
            character: login.character,
            timestamp: new Date(login.timestamp),
          }))
          .filter(login => {
            const loginAge = currentTime.getTime() - login.timestamp.getTime()
            return loginAge <= timeWindow
          })

        // Add new logins
        const loginUpdates = [...validLogins]
        recentLogins.forEach(char => {
          const existingLoginIndex = loginUpdates.findIndex(
            login => login.character.Name === char.Name,
          )
          // We can safely use char.OnlineSince here because we filtered out null values earlier
          const loginData = {
            character: char,
            timestamp: new Date(char.OnlineSince!),
          }

          if (existingLoginIndex !== -1) {
            loginUpdates[existingLoginIndex] = loginData
          } else {
            loginUpdates.push(loginData)
          }
        })

        // Update store with new logins
        setAlertLogins(alertId, loginUpdates)

        // Check if threshold is met
        if (loginUpdates.length >= alert.threshold) {
          const now = Date.now()
          const lastAlertTime = lastAlertTimes[alertId] || 0
          const timeSinceLastAlert = now - lastAlertTime

          if (timeSinceLastAlert >= COOLDOWN_MS || !lastAlertTime) {
            // Clear old timeouts
            alertTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
            alertTimeoutsRef.current = []

            // Set new timeout
            const timeoutId = setTimeout(() => {
              clearAlertLogins(alertId)
            }, timeWindow)
            alertTimeoutsRef.current.push(timeoutId)

            // Trigger alert
            setLastAlertTime(alertId, now)
            playSound(alert.sound)

            return { reachedThreshold: true, alert }
          }
        }
      }

      return { reachedThreshold: false, alert: undefined }
    },
    [
      alerts,
      MAX_LOGIN_AGE_MS,
      alertLogins,
      setAlertLogins,
      lastAlertTimes,
      setLastAlertTime,
      playSound,
      clearAlertLogins,
    ],
  )

  const getRecentLogins = useCallback((): RecentLogin[] => {
    const currentTime = new Date()
    const uniqueLogins = new Map<string, RecentLogin>()

    // First collect all valid logins from all alerts
    alertLogins.forEach(logins => {
      logins.forEach(login => {
        const loginTime = new Date(login.timestamp)
        const onlineTime = currentTime.getTime() - loginTime.getTime()

        // Only include logins that are within 3 minutes
        if (onlineTime <= MAX_LOGIN_AGE_MS) {
          const existing = uniqueLogins.get(login.character.Name)
          if (!existing || loginTime > existing.timestamp) {
            uniqueLogins.set(login.character.Name, {
              character: login.character,
              timestamp: loginTime,
            })
          }
        }
      })
    })

    return Array.from(uniqueLogins.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    )
  }, [MAX_LOGIN_AGE_MS, alertLogins])

  return {
    checkAndTriggerAlerts,
    getRecentLogins,
  }
}
