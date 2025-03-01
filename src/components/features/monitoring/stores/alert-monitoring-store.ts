/* eslint-disable no-console */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import type { StoredLogin, AlertMonitoringState } from './types'

const customStorage = createJSONStorage(() => ({
  ...localStorage,
  getItem: (name: string) => {
    const value = localStorage.getItem(name)
    if (!value) return null

    try {
      const parsed = JSON.parse(value)
      if (!parsed.state) return parsed

      const alertLoginsMap = new Map<string, StoredLogin[]>()

      if (parsed.state.alertLogins && typeof parsed.state.alertLogins === 'object') {
        Object.entries(parsed.state.alertLogins).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            alertLoginsMap.set(key, value)
          }
        })
      }

      return {
        ...parsed,
        state: {
          ...parsed.state,
          alertLogins: alertLoginsMap,
        },
      }
    } catch (error) {
      console.error('[Alert Store] Error parsing stored data:', error)
      return null
    }
  },
  setItem: (name: string, value: string) => {
    try {
      const parsed = JSON.parse(value)
      if (!parsed.state) {
        localStorage.setItem(name, value)
        return
      }
      const alertLoginsObj: Record<string, StoredLogin[]> = {}

      if (parsed.state.alertLogins instanceof Map) {
        parsed.state.alertLogins.forEach((value: StoredLogin[], key: string | number) => {
          alertLoginsObj[key] = value
        })
      }

      const serialized = JSON.stringify({
        ...parsed,
        state: {
          ...parsed.state,
          alertLogins: alertLoginsObj,
        },
      })
      localStorage.setItem(name, serialized)
    } catch (error) {
      console.error('[Alert Store] Error storing data:', error)
    }
  },
}))

export const useAlertMonitoringStore = create<AlertMonitoringState>()(
  persist(
    set => ({
      alertLogins: new Map(),
      lastAlertTimes: {},

      setAlertLogins: (alertId, logins) =>
        set(state => {
          console.log(`[Alert Store] Setting logins for alert ${alertId}:`, logins)
          const newAlertLogins = new Map(state.alertLogins)
          newAlertLogins.set(
            alertId,
            logins.map(login => ({
              character: login.character,
              timestamp: login.timestamp.toISOString(),
            })),
          )
          return { alertLogins: newAlertLogins }
        }),

      setLastAlertTime: (alertId, time) =>
        set(state => {
          console.log(
            `[Alert Store] Setting last alert time for ${alertId}:`,
            new Date(time).toISOString(),
          )
          return {
            lastAlertTimes: {
              ...state.lastAlertTimes,
              [alertId]: time,
            },
          }
        }),

      clearAlertLogins: alertId =>
        set(state => {
          console.log(`[Alert Store] Clearing logins for alert ${alertId}`)
          const newAlertLogins = new Map(state.alertLogins)
          newAlertLogins.delete(alertId)
          const newLastAlertTimes = { ...state.lastAlertTimes }
          delete newLastAlertTimes[alertId]
          return {
            alertLogins: newAlertLogins,
            lastAlertTimes: newLastAlertTimes,
          }
        }),
    }),
    {
      name: 'alert-monitoring-storage',
      storage: customStorage,
    },
  ),
)
