import { CharacterListDTO } from "../../dtos/character-list.dto";
import { RespawnDTO } from "../../dtos/respawn.dto";

export interface CharacterRespawnDTO {
    totalOnline: number;
    character: CharacterListDTO & { onlineTimer: string };
    respawn: RespawnDTO;
}
  