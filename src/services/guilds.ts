import { UpsertPlayerInput } from '../shared/interface/character-upsert.interface';
import api from './api';

export const getSoulwarPlayers = async (world: string) => {
  try {
    const response = await api.get(`/gamedata/soulwars/${world}`);
    console.log(response);
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
    const response = await api.post('/gamedata/insert-player', playerData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getGuildPlayers = async (guildId: string) => {
  try {
    const response = await api.get(`/gamedata/guilds/${guildId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};