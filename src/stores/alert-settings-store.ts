import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { AlertCondition, MonitoredList } from '@/types/alert-types'
import type { GuildMemberResponse } from '@/types/guild-member.response'

const isRecentlyLogged = (char: GuildMemberResponse, timeWindow: Date): boolean => {
  if (!char.OnlineSince || !char.TimeOnline) return false

  // Convert TimeOnline (HH:mm:ss) to minutes
  const [hours, minutes] = char.TimeOnline.split(':').map(Number)
  const timeOnlineMinutes = hours * 60 + minutes

  // Check if character is online and logged in within time window
  return (
    char.OnlineStatus &&
    timeOnlineMinutes < 2 && // Less than 2 minutes online
    new Date(char.OnlineSince) >= timeWindow
  ) // Logged in within time window
}

export const checkAlertCondition = (
  characters: GuildMemberResponse[],
  monitoredTypes: string[],
  alert: AlertCondition,
): { triggered: boolean; reloggedChars: GuildMemberResponse[] } => {
  const now = new Date()
  const timeWindow = new Date(now.getTime() - alert.timeRange * 60 * 1000)

  // Filter characters that are:
  // 1. In monitored lists
  // 2. Recently logged (< 2min online)
  // 3. Logged within time window
  const reloggedChars = characters.filter(
    char => monitoredTypes.includes(char.Kind) && isRecentlyLogged(char, timeWindow),
  )

  return {
    triggered: reloggedChars.length >= alert.threshold,
    reloggedChars,
  }
}

interface AlertSettingsState {
  alerts: AlertCondition[]
  monitoredLists: MonitoredList[]
  isWidgetCollapsed: boolean
  addAlert: (alert: Omit<AlertCondition, 'id' | 'createdAt'>) => void
  removeAlert: (id: string) => void
  toggleAlert: (id: string) => void
  addMonitoredList: (type: string) => void
  removeMonitoredList: (id: string) => void
  toggleMonitoredList: (id: string) => void
}

export const useAlertSettingsStore = create<
  AlertSettingsState & {
    addAlert: (alert: Omit<AlertCondition, 'id' | 'createdAt'>) => void
    removeAlert: (id: string) => void
    toggleAlert: (id: string) => void
    addMonitoredList: (type: string) => void
    removeMonitoredList: (id: string) => void
    toggleMonitoredList: (id: string) => void
  }
>()(
  persist(
    set => ({
      alerts: [],
      monitoredLists: [],
      isWidgetCollapsed: true,
      addAlert: alert =>
        set(state => ({
          alerts: [
            ...state.alerts,
            {
              ...alert,
              id: Date.now().toString(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      removeAlert: id =>
        set(state => ({
          alerts: state.alerts.filter(alert => alert.id !== id),
        })),
      toggleAlert: id =>
        set(state => ({
          alerts: state.alerts.map(alert =>
            alert.id === id ? { ...alert, enabled: !alert.enabled } : alert,
          ),
        })),
      addMonitoredList: type =>
        set(state => ({
          monitoredLists: [
            ...state.monitoredLists,
            {
              id: Date.now().toString(),
              type,
              enabled: true,
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      removeMonitoredList: id =>
        set(state => ({
          monitoredLists: state.monitoredLists.filter(list => list.id !== id),
        })),
      toggleMonitoredList: id =>
        set(state => ({
          monitoredLists: state.monitoredLists.map(list =>
            list.id === id ? { ...list, enabled: !list.enabled } : list,
          ),
        })),
    }),
    { name: 'alert-settings' },
  ),
)
