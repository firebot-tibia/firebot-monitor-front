import { UpsertPlayerInput } from '../shared/interface/character-upsert.interface';
import { api } from './api'

export const getSoulwarPlayers = async (world: string, token: string) => {
  try {
    const response = await api.get(`/gamedata/soulwars/${world}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Soulwar players:', error);
    throw error;
  }
};

export const getOrangeList = async (player: string) => {
  try {
    const response = await api.get(`/gamedata/orange-list/${player}`, {
      withCredentials: true,
    });
    return response.data.orange_list_online; 
  } catch (error) {
    console.error('Error fetching Orange list:', error);
    throw error;
  }
};

export const upsertPlayer = async (playerData: UpsertPlayerInput) => {
  try {
    const response = await api.post('/gamedata/insert-player', playerData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error upserting player:', error);
    throw error;
  }
};