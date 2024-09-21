import { UpsertPlayerInput } from '../shared/interface/character-upsert.interface';
import { ExperienceListQuery } from '../shared/interface/guild-stats.interface';
import api from './api';

export const upsertPlayer = async (playerData: UpsertPlayerInput) => {
  try {
    const response = await api.post('/gamedata/insert-player-editor', playerData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getExperienceList = async (query: ExperienceListQuery) => {
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

export const getPlayersLifeTimeDeaths = async (query: { character: string; }) => {
  try {
    const response = await api.get(`/gamedata/players/deaths`, {
      params: query,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPlayerExperienceHistory = async (query: { character: string; }) => {
  try {
    const response = await api.get(`/gamedata/players/experience-history`, {
      params: query,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getGuildStats = async (query: { guild_id: string; }) => {
  try {
    const response = await api.get(`/gamedata/guilds/statistics`, {
      params: query,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
