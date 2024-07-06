import { UseToastOptions } from "@chakra-ui/react";
import { CharacterRespawnDTO } from "../../../shared/interface/character-list.interface";

export interface TableWidgetProps {
    data: CharacterRespawnDTO[];
    columns: string[];
    isLoading: boolean;
}
  
export interface RespawnInputProps {
    characterName: string;
    localRespawnData: { [key: string]: string };
    setLocalRespawnData: (data: { [key: string]: string }) => void;
    toast: (options?: UseToastOptions) => void;
}

export interface PTIconProps {
    characterName: string;
    localIconState: { [key: string]: string };
    setLocalIconState: (data: { [key: string]: string }) => void;
    selectedCharacters: string[];
    setSelectedCharacters: (data: string[]) => void;
    data: CharacterRespawnDTO[];
    toast: (options?: UseToastOptions) => void;
}
  