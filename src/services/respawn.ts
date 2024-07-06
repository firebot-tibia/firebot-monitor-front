import { RespawnDTO } from "../dtos/respawn.dto";
import { api } from "./api";

export const getRespawn = async () => {
    return api.get('/respawn/all')
  };
  
  export const updateRespawn = async (characterMame: string, data: Omit<RespawnDTO, 'id'>) => {
    return api.put(`/respawn/${characterMame}`, data);
  };
  