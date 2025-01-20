import { jwtDecode } from 'jwt-decode'
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
    const decoded = jwtDecode<DecodedToken>(token)
    set({ decodedToken: decoded })
    const worlds = Object.keys(decoded.guilds)
    const storedWorld = useStorageStore.getState().getItem('selectedWorld', '')
    set({ decodedToken: decoded, userStatus: decoded.status })
    if (worlds.length > 0 && (!storedWorld || !worlds.includes(storedWorld))) {
      set({ selectedWorld: worlds[0] })
      useStorageStore.getState().setItem('selectedWorld', worlds[0])
    } else if (storedWorld) {
      set({ selectedWorld: storedWorld })
    }
    const { mode } = get()
    if (decoded.guilds[get().selectedWorld]) {
      const guildId =
        mode === 'ally'
          ? decoded.guilds[get().selectedWorld].ally_guild.id
          : decoded.guilds[get().selectedWorld].enemy_guild.id
      useStorageStore.getState().setItem('selectedGuildId', guildId)
    }
  },
}))
