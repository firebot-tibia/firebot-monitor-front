import { create } from 'zustand';
import { getExperienceList } from '../services/guilds';
import { ExperienceListQuery, GuildData } from '../shared/interface/guild/guild-stats.interface';


interface GuildStatsState {
  filter: string;
  sort: string;
  vocationFilter: string;
  nameFilter: string;
  allyGuildData: GuildData;
  enemyGuildData: GuildData;
  allyCurrentPage: number;
  enemyCurrentPage: number;
  loading: boolean;
  selectedCharacter: string | null;
  itemsPerPage: number;

  setFilter: (filter: string) => void;
  setVocationFilter: (vocation: string) => void;
  setNameFilter: (name: string) => void;
  setPage: (guildType: 'ally' | 'enemy', page: number) => void;
  setSelectedCharacter: (character: string | null) => void;
  fetchGuildStats: (guildType: 'ally' | 'enemy') => Promise<void>;
}

export const useGuildStatsStore = create<GuildStatsState>((set, get) => ({
  filter: 'Diaria',
  sort: 'exp_yesterday',
  vocationFilter: '',
  nameFilter: '',
  allyGuildData: { data: [], totalPages: 1, totalExp: 0, avgExp: 0 },
  enemyGuildData: { data: [], totalPages: 1, totalExp: 0, avgExp: 0 },
  allyCurrentPage: 1,
  enemyCurrentPage: 1,
  loading: false,
  selectedCharacter: null,
  itemsPerPage: 30,

  setFilter: (filter) => {
    const newSort = filter === 'Diaria' ? 'exp_yesterday' : 
                    filter === 'Semanal' ? 'exp_week' : 'exp_month';
    set({ filter, sort: newSort, allyCurrentPage: 1, enemyCurrentPage: 1 });
    get().fetchGuildStats('ally');
    get().fetchGuildStats('enemy');
  },

  setVocationFilter: (vocation) => {
    set({ vocationFilter: vocation, allyCurrentPage: 1, enemyCurrentPage: 1 });
    get().fetchGuildStats('ally');
    get().fetchGuildStats('enemy');
  },

  setNameFilter: (name) => {
    set({ nameFilter: name.trim(), allyCurrentPage: 1, enemyCurrentPage: 1 });
    get().fetchGuildStats('ally');
    get().fetchGuildStats('enemy');
  },

  setPage: (guildType, page) => {
    set({ [guildType === 'ally' ? 'allyCurrentPage' : 'enemyCurrentPage']: page });
    get().fetchGuildStats(guildType);
  },

  setSelectedCharacter: (character) => set({ selectedCharacter: character }),

  fetchGuildStats: async (guildType) => {
    const { filter, sort, vocationFilter, nameFilter, itemsPerPage } = get();
    const currentPage = guildType === 'ally' ? get().allyCurrentPage : get().enemyCurrentPage;

    set({ loading: true });

    try {
      const query: ExperienceListQuery = {
        kind: guildType,
        vocation: vocationFilter,
        name: nameFilter,
        sort: sort,
        offset: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      };

      const response = await getExperienceList(query);

      const experienceField =
        filter === 'Diaria' ? 'experience_one_day' :
        filter === 'Semanal' ? 'experience_one_week' : 'experience_one_month';

      const formattedData = response.exp_list.players.map((player: any) => ({
        experience: player[experienceField],
        vocation: player.vocation,
        name: player.name,
        level: player.level,
        online: player.online,
      }));

      const totalExp = filter === 'Diaria' ? response.exp_list.total_exp_yesterday :
                       filter === 'Semanal' ? response.exp_list.total_exp_7_days : response.exp_list.total_exp_30_days;
      
      const avgExp = filter === 'Diaria' ? response.exp_list.medium_exp_yesterday :
                     filter === 'Semanal' ? response.exp_list.medium_exp_7_days : response.exp_list.medium_exp_30_days;

      const newData = {
        data: formattedData,
        totalPages: Math.ceil(response.exp_list.Count.records / itemsPerPage),
        totalExp,
        avgExp,
      };

      set({ [guildType === 'ally' ? 'allyGuildData' : 'enemyGuildData']: newData, loading: false });
    } catch (error) {
      console.error(`Failed to fetch ${guildType} guild stats:`, error);
      set({ loading: false });
    }
  },
}));