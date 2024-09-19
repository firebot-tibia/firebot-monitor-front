import { UpsertPlayerInput } from '../shared/interface/character-upsert.interface';
import api from './api';

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

export const getPlayerOnlineHistory = async (query: { character: string; }) => {
  try {
    const response = await api.get(`/gamedata/online-time`, {
      params: query,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

