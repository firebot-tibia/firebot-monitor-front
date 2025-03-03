import { create } from 'zustand'

import { useStorageStore } from '../../../core/store/storage-store'
import { getExperienceList } from '../services'
import type { ExperienceListQuery, GuildData } from '../types/guild-stats.interface'

interface GuildStatsState {
  // Data
  allyGainData: GuildData
  allyLossData: GuildData
  enemyGainData: GuildData
  enemyLossData: GuildData

  // Pagination
  allyGainPage: number
  allyLossPage: number
  enemyGainPage: number
  enemyLossPage: number

  // UI State
  loading: boolean
  filter: string
  sort: string
  vocationFilter: string
  nameFilter: string
  selectedCharacter: string | null
  itemsPerPage: number

  // Actions
  setFilter: (filter: string) => void
  setVocationFilter: (vocation: string) => void
  setNameFilter: (name: string) => void
  setPage: (guildType: 'allyGain' | 'allyLoss' | 'enemyGain' | 'enemyLoss', page: number) => void
  setSelectedCharacter: (character: string | null) => void
  fetchGuildStats: (guildType: 'ally' | 'enemy') => Promise<void>
}

const emptyGuildData: GuildData = {
  data: [],
  totalPages: 0,
  totalExp: 0,
  avgExp: 0,
  page: 1,
}

export const useGuildStatsStore = create<GuildStatsState>((set, get) => ({
  // Initial state
  filter: 'Diaria',
  sort: 'exp_yesterday',
  vocationFilter: '',
  nameFilter: '',
  allyGainData: { ...emptyGuildData },
  allyLossData: { ...emptyGuildData },
  enemyGainData: { ...emptyGuildData },
  enemyLossData: { ...emptyGuildData },
  allyGainPage: 1,
  allyLossPage: 1,
  enemyGainPage: 1,
  enemyLossPage: 1,
  loading: false,
  selectedCharacter: null,
  itemsPerPage: 30,

  // Actions
  setFilter: filter => {
    const newSort =
      filter === 'Diaria' ? 'exp_yesterday' : filter === 'Semanal' ? 'exp_week' : 'exp_month'
    set({
      filter,
      sort: newSort,
      allyGainPage: 1,
      allyLossPage: 1,
      enemyGainPage: 1,
      enemyLossPage: 1,
    })
    get().fetchGuildStats('ally')
    get().fetchGuildStats('enemy')
  },

  setVocationFilter: vocation => {
    set({
      vocationFilter: vocation,
      allyGainPage: 1,
      allyLossPage: 1,
      enemyGainPage: 1,
      enemyLossPage: 1,
    })
    get().fetchGuildStats('ally')
    get().fetchGuildStats('enemy')
  },

  setNameFilter: name => {
    set({
      nameFilter: name.trim(),
      allyGainPage: 1,
      allyLossPage: 1,
      enemyGainPage: 1,
      enemyLossPage: 1,
    })
    get().fetchGuildStats('ally')
    get().fetchGuildStats('enemy')
  },

  setPage: (guildType, page) => {
    set({ [`${guildType}Page`]: page })
    get().fetchGuildStats(guildType.startsWith('ally') ? 'ally' : 'enemy')
  },

  setSelectedCharacter: character => set({ selectedCharacter: character }),

  fetchGuildStats: async guildType => {
    const {
      filter,
      sort,
      vocationFilter,
      nameFilter,
      itemsPerPage,
      allyGainPage,
      allyLossPage,
      enemyGainPage,
      enemyLossPage,
    } = get()
    set({ loading: true })

    try {
      const selectedWorld = useStorageStore.getState().getItem('selectedWorld', '')

      const query: ExperienceListQuery = {
        kind: guildType,
        world: selectedWorld,
        vocation: vocationFilter,
        name: nameFilter,
        sort: sort,
        offset: 0,
      }

      const response = await getExperienceList(query)

      const experienceField =
        filter === 'Diaria'
          ? 'experience_one_day'
          : filter === 'Semanal'
            ? 'experience_one_week'
            : 'experience_one_month'

      const formattedData = response.exp_list.players.map((player: any) => ({
        experience: player[experienceField],
        vocation: player.vocation,
        name: player.name,
        level: player.level,
      }))

      const gainData = formattedData.filter((player: any) => {
        const exp = parseInt(player.experience.replace(/,/g, ''))
        return exp > 0
      })

      const lossData = formattedData
        .filter((player: any) => {
          const exp = parseInt(player.experience.replace(/,/g, ''))
          return exp < 0
        })
        .sort((a: any, b: any) => {
          const expA = parseInt(a.experience.replace(/,/g, ''))
          const expB = parseInt(b.experience.replace(/,/g, ''))
          return expA - expB
        })

      const calculateTotalExp = (data: any[]) => {
        return data.reduce((total, player) => {
          const exp = parseInt(player.experience.replace(/,/g, ''))
          return total + exp
        }, 0)
      }

      const gainTotalExp = calculateTotalExp(gainData)
      const lossTotalExp = calculateTotalExp(lossData)

      const gainAvgExp = gainData.length > 0 ? gainTotalExp / gainData.length : 0
      const lossAvgExp = lossData.length > 0 ? lossTotalExp / lossData.length : 0

      const newGainData = {
        data: gainData.slice(
          (guildType === 'ally' ? allyGainPage - 1 : enemyGainPage - 1) * itemsPerPage,
          (guildType === 'ally' ? allyGainPage : enemyGainPage) * itemsPerPage,
        ),
        totalPages: Math.ceil(gainData.length / itemsPerPage),
        totalExp: gainTotalExp,
        avgExp: gainAvgExp,
        page: guildType === 'ally' ? allyGainPage : enemyGainPage,
      }

      const newLossData = {
        data: lossData.slice(
          (guildType === 'ally' ? allyLossPage - 1 : enemyLossPage - 1) * itemsPerPage,
          (guildType === 'ally' ? allyLossPage : enemyLossPage) * itemsPerPage,
        ),
        totalPages: Math.ceil(lossData.length / itemsPerPage),
        totalExp: lossTotalExp,
        avgExp: lossAvgExp,
        page: guildType === 'ally' ? allyLossPage : enemyLossPage,
      }

      if (guildType === 'ally') {
        set({ allyGainData: newGainData, allyLossData: newLossData, loading: false })
      } else {
        set({ enemyGainData: newGainData, enemyLossData: newLossData, loading: false })
      }
    } catch (error) {
      console.error('Error fetching guild stats:', error)
      set({ loading: false })
    }
  },
}))
