import { CharacterListDTO } from '../dtos/character-list.dto';
import { api } from './api'

export const getCharacter = async () => {
  return api.get('/character/all')
};

export const postCharacter = async (data: Omit<CharacterListDTO, 'id'>) => {
  return api.post('/character', data)
}

export const updateCharacter = async (id: string, data: Omit<CharacterListDTO, 'id'>) => {
  return api.put(`/character/${id}`, data);
};