import { CharacterType } from "../shared/enum/character-type.enum";

export interface CharacterListDTO {
    id?: string;
    name?: string;
    vocation?: string;
    level?: number;
    type: CharacterType;
  }
  
