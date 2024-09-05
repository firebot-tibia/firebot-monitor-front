import { Worlds } from '../constant/world';
import { UpsertPlayerInput } from '../shared/interface/character-upsert.interface';
import { WorldData, WarStatus } from '../shared/interface/war.interface';
import api from './api';

export const getSoulwarPlayers = async (world: string) => {
  try {
    const response = await api.get(`/gamedata/soulwars/${world}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOrangeList = async (player: string) => {
  try {
    const response = await api.get(`/gamedata/orange-list?player=${player}`);
    return response.data.orange_list_online; 
  } catch (error) {
    throw error;
  }
};

export const upsertPlayer = async (playerData: UpsertPlayerInput) => {
  try {
    const response = await api.post('/gamedata/insert-player-editor', playerData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getExperienceList = async (query: { kind: string; vocation: string; name: string; sort: string; offset: number; limit: number }) => {
  try {
    const response = await api.get(`/gamedata/experience-list`, {
      params: query,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchWorldsData = async (): Promise<WorldData[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  return Worlds.map(world => ({
    world,
    status: ['Dominado', 'Em Guerra', 'Sofrendo ataques'][Math.floor(Math.random() * 3)] as WarStatus,
    dominantGuild: `Guild${Math.floor(Math.random() * 1000)}`,
    enemyGuild: Math.random() > 0.5 ? `Enemy${Math.floor(Math.random() * 1000)}` : null,
    playersOnline: Math.floor(Math.random() * 100),
    totalPlayersDominated: Math.floor(Math.random() * 100),
    totalPlayersEnemy: Math.floor(Math.random() * 2000) + 1000,
    alliance: `Alliance${Math.floor(Math.random() * 10)}`,
  }));
};

export const fetchWorldDetails = async (world: string): Promise<WorldData> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    world,
    status: ['Dominado', 'Em Guerra', 'Sofrendo ataques'][Math.floor(Math.random() * 3)] as WarStatus,
    dominantGuild: `Guild${Math.floor(Math.random() * 1000)}`,
    enemyGuild: Math.random() > 0.5 ? `Enemy${Math.floor(Math.random() * 1000)}` : null,
    playersOnline: Math.floor(Math.random() * 100),
    totalPlayersDominated: Math.floor(Math.random() * 2000) + 1000,
    totalPlayersEnemy: Math.floor(Math.random() * 100),
    alliance: `Alliance${Math.floor(Math.random() * 10)}`,
  };
};
