import { UpsertPlayerInput } from '../shared/interface/character-upsert.interface';
import { ExperienceListQuery } from '../shared/interface/guild/guild-stats.interface';
import { CreateReservationData, Respawn } from '../shared/interface/reservations.interface';
import api from '../lib/api';

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

export const getReservationsList = async (query: { 
  guild_id: string;
  status?: 'reserved' | 'canceled' | 'free';
  start_time_greater?: string;
  start_time_less?: string;
  end_time_greater?: string;
  end_time_less?: string;
  kind?: 'ally' | 'enemy';
}): Promise<any> => {
  try {
    const response = await api.get('/reservations/list', {
      params: query,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createRespawn = async (respawnData: Respawn) => {
  try {
    const response = await api.post('/respawns/create', { ...respawnData, premium: true });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeRespawnApi = async ( id: string) => {
  try {
    const response = await api.delete(`/respawns/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllRespawnsPremiums  = async () => {
  try {
    const response = await api.get(`/respawns/list-premium`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createReservation = async (reservationData: CreateReservationData) => {
  try {
    const response = await api.post('/reservations/create', reservationData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteReservation = async (id: string) => {
  try {
    const response = await api.delete(`/reservations/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};