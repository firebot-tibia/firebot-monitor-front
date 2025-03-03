import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import type { GuildStatsPlayer } from '../types/guild-stats-player.interface'

interface DateRange {
  startDate: Date | null
  endDate: Date | null
}

interface Filters {
  date: DateRange
  vocation: string
  name: string
  type: 'ally' | 'enemy'
  mode: 'gain' | 'loss'
}

interface StatisticsState {
  // Data
  allyStats: GuildStatsPlayer[]
  enemyStats: GuildStatsPlayer[]
  selectedPlayer: GuildStatsPlayer | null

  // UI State
  isLoading: boolean
  currentPage: number
  itemsPerPage: number
  filters: Filters

  // Computed
  totalPages: number
  filteredStats: GuildStatsPlayer[]

  // Actions
  setFilters: (filters: Partial<Filters>) => void
  setPage: (page: number) => void
  setItemsPerPage: (items: number) => void
  selectPlayer: (player: GuildStatsPlayer | null) => void
  fetchStats: () => Promise<void>
  resetFilters: () => void
}

const DEFAULT_FILTERS: Filters = {
  date: {
    startDate: null,
    endDate: null,
  },
  vocation: '',
  name: '',
  type: 'ally',
  mode: 'gain',
}

export const useStatisticsStore = create<StatisticsState>()(
  devtools(
    (set, get) => ({
      // Initial State
      allyStats: [],
      enemyStats: [],
      selectedPlayer: null,
      isLoading: false,
      currentPage: 1,
      itemsPerPage: 10,
      filters: DEFAULT_FILTERS,
      totalPages: 0,
      filteredStats: [],

      // Actions
      setFilters: newFilters => {
        set(state => ({
          filters: { ...state.filters, ...newFilters },
          currentPage: 1, // Reset to first page when filters change
        }))
        get().fetchStats() // Refetch with new filters
      },

      setPage: page => {
        set({ currentPage: page })
      },

      setItemsPerPage: items => {
        set({ itemsPerPage: items, currentPage: 1 })
      },

      selectPlayer: player => {
        set({ selectedPlayer: player })
      },

      fetchStats: async () => {
        const state = get()
        set({ isLoading: true })

        try {
          // TODO: Implement API call with filters
          // const response = await statisticsService.fetchStats(state.filters)
          // set({
          //   [state.filters.type === 'ally' ? 'allyStats' : 'enemyStats']: response.data,
          //   totalPages: Math.ceil(response.total / state.itemsPerPage)
          // })
        } catch (error) {
          console.error('Error fetching stats:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      resetFilters: () => {
        set({ filters: DEFAULT_FILTERS, currentPage: 1 })
        get().fetchStats()
      },
    }),
    { name: 'statistics-store' },
  ),
)
