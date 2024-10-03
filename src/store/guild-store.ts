import { create } from 'zustand';
import { GuildMemberResponse } from '../shared/interface/guild/guild-member.interface';

interface GuildState {
  enemyGuildData: GuildMemberResponse[];
  allyGuildData: GuildMemberResponse[];
  setEnemyGuildData: (data: GuildMemberResponse[]) => void;
  setAllyGuildData: (data: GuildMemberResponse[]) => void;
}

export const useGuildStore = create<GuildState>((set) => ({
  enemyGuildData: [],
  allyGuildData: [],
  setEnemyGuildData: (data) => set({ enemyGuildData: data }),
  setAllyGuildData: (data) => set({ allyGuildData: data }),
}));