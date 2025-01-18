import { create } from 'zustand'

import type { Death } from '../components/features/guilds-monitoring/types/death.interface'
import type { Level } from '../components/features/guilds-monitoring/types/level.interface'

interface GlobalState {
  deathList: Death[]
  levelUpList: Level[]
  levelDownList: Level[]
  newDeathCount: number
  newLevelUpCount: number
  newLevelDownCount: number
  addDeath: (death: Death) => void
  addLevelUp: (levelUp: Level) => void
  addLevelDown: (levelDown: Level) => void
  resetNewCounts: () => void
  error: string | null
  setError: (error: string | null) => void
}

export const useGlobalStore = create<GlobalState>()(set => ({
  deathList: [],
  levelUpList: [],
  levelDownList: [],
  newDeathCount: 0,
  newLevelUpCount: 0,
  newLevelDownCount: 0,
  addDeath: death =>
    set(state => ({
      deathList: [death, ...state.deathList],
      newDeathCount: state.newDeathCount + 1,
    })),
  addLevelUp: levelUp =>
    set(state => ({
      levelUpList: [levelUp, ...state.levelUpList],
      newLevelUpCount: state.newLevelUpCount + 1,
    })),
  addLevelDown: levelDown =>
    set(state => ({
      levelDownList: [levelDown, ...state.levelDownList],
      newLevelDownCount: state.newLevelDownCount + 1,
    })),
  resetNewCounts: () =>
    set({
      newDeathCount: 0,
      newLevelUpCount: 0,
      newLevelDownCount: 0,
    }),
  error: null,
  setError: error => set({ error }),
}))
