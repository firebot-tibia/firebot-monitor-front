import * as jwtDecode from 'jsonwebtoken'
import { create } from 'zustand'

import { useStorageStore } from './storage-store'

interface Guild {
  id: string
  name: string
  created_at: string
}

interface GuildPair {
  ally_guild: Guild
  enemy_guild: Guild
}

interface DecodedToken {
  exp: number
  guilds: Record<string, GuildPair>
  status: string
  sub: string
}

type MonitorMode = 'ally' | 'enemy'

interface TokenState {
  decodedToken: DecodedToken | null
  selectedWorld: string
  mode: MonitorMode
  userStatus: string
  setSelectedWorld: (world: string) => void
  decodeAndSetToken: (token: string) => void
}

export const useTokenStore = create<TokenState>((set, get) => ({
  decodedToken: null,
  selectedWorld: useStorageStore.getState().getItem('selectedWorld', ''),
  mode: useStorageStore.getState().getItem('monitorMode', 'enemy') as MonitorMode,
  userStatus: useStorageStore.getState().getItem('userStatus', ''),
  setSelectedWorld: (world: string) => {
    set({ selectedWorld: world })
    useStorageStore.getState().setItem('selectedWorld', world)
    const { decodedToken, mode } = get()
    if (decodedToken && decodedToken.guilds[world]) {
      const guildId =
        mode === 'ally'
          ? decodedToken.guilds[world].ally_guild.id
          : decodedToken.guilds[world].enemy_guild.id
      useStorageStore.getState().setItem('selectedGuildId', guildId)
    }
  },
  decodeAndSetToken: (token: string) => {
    try {
      // Decode token and validate
      const decoded = jwtDecode.decode(token) as DecodedToken
      if (!decoded || !decoded.guilds) {
        throw new Error('Invalid token format')
      }

      // Get available worlds
      const worlds = Object.keys(decoded.guilds)
      if (worlds.length === 0) {
        throw new Error('No worlds available in token')
      }

      // Get stored world or use first available
      const storedWorld = useStorageStore.getState().getItem('selectedWorld', '')
      const selectedWorld = worlds.includes(storedWorld) ? storedWorld : worlds[0]

      // Update state in a single set call
      set({
        decodedToken: decoded,
        userStatus: decoded.status,
        selectedWorld,
      })

      // Update storage
      useStorageStore.getState().setItem('selectedWorld', selectedWorld)

      // Update guild ID
      const { mode } = get()
      if (decoded.guilds[selectedWorld]) {
        const guildId =
          mode === 'ally'
            ? decoded.guilds[selectedWorld].ally_guild.id
            : decoded.guilds[selectedWorld].enemy_guild.id
        useStorageStore.getState().setItem('selectedGuildId', guildId)
      }
    } catch (error) {
      console.error('Error decoding token:', error)
      set({ decodedToken: null, userStatus: '', selectedWorld: '' })
      throw error
    }
  },
}))
