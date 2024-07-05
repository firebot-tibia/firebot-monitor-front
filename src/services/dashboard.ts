import { CharacterListDTO } from '../dtos/character-list.dto';
import { RespawnDTO } from '../dtos/respawn.dto'
import { api } from './api'

export const getEnemyGuild = async () => {
  return api.get('/dashboard/guilds')
}

export const getRespawn = async () => {
  return api.get('/dashboard/respawn/all')
};

export const postRespawn = async (data: Omit<RespawnDTO, 'id'>) => {
  return api.post('/dashboard/respawn', data)
}

export const updateRespawn = async (characterMame: string, data: Omit<RespawnDTO, 'id'>) => {
  return api.put(`/dashboard/respawn/${characterMame}`, data);
};

export const getCharacter = async () => {
  return api.get('/dashboard/character/all')
};

export const postCharacter = async (data: Omit<CharacterListDTO, 'id'>) => {
  return api.post('/dashboard/character', data)
}

export const updateCharacter = async (id: string, data: Omit<CharacterListDTO, 'id'>) => {
  return api.put(`/dashboard/character/${id}`, data);
};