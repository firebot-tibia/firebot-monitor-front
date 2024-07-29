import { CharacterListDTO } from '../dtos/character-list.dto';
import { api } from './api'

export const updateCharacter = async (name: string, data: Omit<CharacterListDTO, 'id'>) => {
  return api.put(`/character/${name}`, data);
};