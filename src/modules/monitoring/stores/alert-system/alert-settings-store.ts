import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { AlertCondition } from '../../types/alert'

interface AlertSettingsState {
  alerts: AlertCondition[]
  isWidgetCollapsed: boolean
  excludedVocations: string[]
  addAlert: (alert: Omit<AlertCondition, 'id' | 'createdAt'>) => void
  removeAlert: (id: string) => void
  toggleAlert: (id: string) => void
  updateAlert: (id: string, field: keyof AlertCondition, value: any) => void
  toggleWidget: () => void
  setExcludedVocations: (vocations: string[]) => void
}

export const useAlertSettingsStore = create<
  AlertSettingsState & {
    addAlert: (alert: Omit<AlertCondition, 'id' | 'createdAt'>) => void
    removeAlert: (id: string) => void
    toggleAlert: (id: string) => void
    updateAlert: (id: string, field: keyof AlertCondition, value: any) => void
    toggleWidget: () => void
  }
>()(
  persist(
    set => ({
      alerts: [],
      isWidgetCollapsed: false, // Start collapsed
      excludedVocations: ['Elite Knight', 'Knight'],
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
      updateAlert: (id, field, value) =>
        set(state => {
          // Validate number inputs
          if (field === 'timeRange' || field === 'threshold') {
            if (typeof value === 'string') {
              const numValue = parseInt(value)
              if (isNaN(numValue) || numValue < 1) return state
              value = numValue
            } else if (typeof value === 'number') {
              if (value < 1) return state
            } else {
              return state
            }
          }

          const updatedAlerts = state.alerts.map(alert =>
            alert.id === id ? { ...alert, [field]: value } : alert,
          )

          return {
            alerts: updatedAlerts,
          }
        }),
      toggleWidget: () =>
        set(state => ({
          isWidgetCollapsed: !state.isWidgetCollapsed,
        })),
      setExcludedVocations: vocations =>
        set(() => ({
          excludedVocations: vocations,
        })),
    }),
    { name: 'alert-settings' },
  ),
)
