import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { WorldStatus, WorldStatusInfo } from './types'

interface WorldStatusState {
  worldStatuses: WorldStatusInfo[]
  updateWorldStatus: (world: string, status: WorldStatus) => void
  getWorldStatus: (world: string) => WorldStatus | undefined
}

const INITIAL_WORLD_STATUSES: WorldStatusInfo[] = [
  { name: 'Cantabra', status: 'DOMINATED' },
  { name: 'Gladibra', status: 'UNDER_ATTACK' },
  { name: 'Honbra', status: 'WAR' },
  { name: 'Inabra', status: 'WAR' },
  { name: 'Jadebra', status: 'WAR' },
  { name: 'Lutabra', status: 'DOMINATED' },
  { name: 'Ombra', status: 'WAR' },
  { name: 'Ourobra', status: 'WAR' },
  { name: 'Quebra', status: 'DOMINATED' },
  { name: 'Quelibra', status: 'WAR' },
  { name: 'Rasteibra', status: 'WAR' },
  { name: 'Serdebra', status: 'WAR' },
  { name: 'Unebra', status: 'DOMINATED' },
]

export const useWorldStatusStore = create<WorldStatusState>()(
  persist(
    (set, get) => ({
      worldStatuses: INITIAL_WORLD_STATUSES,
      updateWorldStatus: (world, status) =>
        set(state => ({
          worldStatuses: state.worldStatuses.map(w =>
            w.name.toLowerCase() === world.toLowerCase() ? { ...w, status } : w,
          ),
        })),
      getWorldStatus: world =>
        get().worldStatuses.find(w => w.name.toLowerCase() === world.toLowerCase())?.status,
    }),
    {
      name: 'world-status-store',
    },
  ),
)
