import { RespawnDTO } from "../dtos/respawn.dto";
import { api } from "./api";

export const getRespawn = async () => {
    return api.get('/respawn/all')
  };
  
  export const postRespawn = async (data: Omit<RespawnDTO, 'id'>) => {
    return api.post('/respawn', data)
  }
  
  export const updateRespawn = async (characterMame: string, data: Omit<RespawnDTO, 'id'>) => {
    return api.put(`/respawn/${characterMame}`, data);
  };
  