'use client';

import { Tr, Td } from "@chakra-ui/react";
import { FC } from "react";
import { CharacterMenu } from "../character-menu-table";
import { RespawnInput } from "../respawn-input";
import { getVocationIcon } from "../utils/table.utils";
import { TableWidgetRowProps } from "../interface/table.interface";
import PTIcon from "../pt-icon";

const TableWidgetRow: FC<TableWidgetRowProps> = ({
  row,
  localRespawnData,
  setLocalRespawnData,
  selectedCharacters,
  setSelectedCharacters,
  localIconState,
  setLocalIconState,
  handleCopy,
  copyAllNames,
  copyAllExivas,
  toast,
  data,
}) => {
  const characterName = row.character.name || 'Desconhecido';

  return (
    <Tr color="white">
      <Td color="white" fontSize="sm">
        <img
          src={getVocationIcon(row.character.vocation || '')}
          alt={row.character.vocation || 'Desconhecido'}
          width="24"
          height="24"
        />
      </Td>
      <Td color="white" fontSize="sm">
        <CharacterMenu 
          characterName={characterName} 
          handleCopy={() => handleCopy(row.character.name, toast)}
          copyAllNames={copyAllNames} 
          copyAllExivas={copyAllExivas} 
        />
      </Td>
      <Td color="white" fontSize="sm">{row.character.level}</Td>
      <Td color="white" fontSize="sm">{row.character.onlineTimer}</Td>
      <Td color="white" fontSize="sm">
        <RespawnInput 
          characterName={characterName} 
          localRespawnData={localRespawnData} 
          setLocalRespawnData={setLocalRespawnData} 
          toast={toast} 
        />
      </Td>
      <Td color="white" fontSize="sm">
        <PTIcon 
          characterName={characterName} 
          localIconState={localIconState} 
          setLocalIconState={setLocalIconState} 
          selectedCharacters={selectedCharacters} 
          setSelectedCharacters={setSelectedCharacters} 
          data={data} 
          toast={toast} 
        />
      </Td>
    </Tr>
  );
}

export default TableWidgetRow;
