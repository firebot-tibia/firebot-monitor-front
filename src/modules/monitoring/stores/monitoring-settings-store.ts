import { create } from 'zustand'

interface MonitoringSettings {
  timeThreshold: number
  memberThreshold: number
}

interface MonitoringSettingsState extends MonitoringSettings {
  updateSettings: (settings: Partial<MonitoringSettings>) => void
}

export const useMonitoringSettingsStore = create<MonitoringSettingsState>(set => ({
  timeThreshold: 5,
  memberThreshold: 2,
  updateSettings: settings =>
    set(state => ({
      ...state,
      ...settings,
    })),
}))
