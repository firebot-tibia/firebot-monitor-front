import { create } from 'zustand'

import { getAllRespawns } from '../services/respawn.service'

interface Respawn {
  id: string
  name: string
  description: string
  premium: boolean
  alias: string
}

interface RespawnsState {
  respawns: Respawn[]
  lastFetched: number | null
  isLoading: boolean
  error: string | null
  fetchRespawns: () => Promise<void>
  shouldRefetch: () => boolean
}

const CACHE_DURATION = 5 * 60 * 1000

export const useRespawnsStore = create<RespawnsState>((set, get) => ({
  respawns: [],
  lastFetched: null,
  isLoading: false,
  error: null,

  shouldRefetch: () => {
    const state = get()
    if (!state.lastFetched) return true
    return Date.now() - state.lastFetched > CACHE_DURATION
  },

  fetchRespawns: async () => {
    if (get().isLoading) return

    if (!get().shouldRefetch() && get().respawns.length > 0) {
      return
    }

    set({ isLoading: true, error: null })

    try {
      const respawnsData = await getAllRespawns()
      set({
        respawns: respawnsData,
        lastFetched: Date.now(),
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch respawns',
        isLoading: false,
      })
    }
  },
}))
