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
    setLocalIconState: (state: { [key: string]: string }) => void;
    selectedCharacters: string[];
    setSelectedCharacters: (characters: string[]) => void;
    data: CharacterRespawnDTO[];
    toast: (options?: UseToastOptions) => void;
  }
  
  export interface TableWidgetRowProps {
    row: CharacterRespawnDTO;
    localRespawnData: { [key: string]: string };
    setLocalRespawnData: (data: { [key: string]: string }) => void;
    selectedCharacters: string[];
    setSelectedCharacters: (characters: string[]) => void;
    localIconState: { [key: string]: string };
    setLocalIconState: (state: { [key: string]: string }) => void;
    handleCopy: (name: string | undefined, toast: (options?: UseToastOptions) => void) => void;
    copyAllNames: () => void;
    copyAllExivas: () => void;
    toast: (options?: UseToastOptions) => void;
    data: CharacterRespawnDTO[];
  }

  export interface CharacterMenuProps {
    characterName: string;
    handleCopy: (name: string | undefined) => void;
    copyAllNames: () => void;
    copyAllExivas: () => void;
  }
  