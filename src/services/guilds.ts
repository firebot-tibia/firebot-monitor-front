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

