import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MonitoringState {
  threshold: number
  timeWindow: number
  monitoredLists: string[]
  setThreshold: (value: number) => void
  setTimeWindow: (value: number) => void
  setMonitoredLists: (value: string[]) => void
}

export const useMonitoringStore = create<MonitoringState>()(
  persist(
    (set) => ({
      threshold: 5,
      timeWindow: 120,
      monitoredLists: ['bomba', 'maker'],
      setThreshold: (value) => set({ threshold: value }),
      setTimeWindow: (value) => set({ timeWindow: value }),
      setMonitoredLists: (value) => set({ monitoredLists: value }),
    }),
    {
      name: 'monitoring-store',
    },
  ),
)
