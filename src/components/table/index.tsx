'use client';

import { useToast, TableContainer, Table, Thead, Tr, Th, Tbody, Td, Tooltip, Input } from "@chakra-ui/react";
import { useState, useEffect, FC } from "react";
import { updateRespawn } from "../../services/respawn";
import { CharacterRespawnDTO } from "../../shared/interface/character-list.interface";
import { CharacterMenu } from "./character-menu-table";
import { getVocationIcon, handleCopy, copyAllNames, copyAllExivas } from "./utils/table.utils";

export interface TableWidgetProps {
  data: CharacterRespawnDTO[];
  columns: string[];
  isLoading: boolean;
}

export const TableWidget: FC<TableWidgetProps> = ({ data, columns, isLoading }) => {
  const toast = useToast();
  const [localRespawnData, setLocalRespawnData] = useState<{ [key: string]: string }>({});
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [localIconState, setLocalIconState] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialLoad) {
      const respawnData = data.reduce((acc, item) => {
        if (item.character.name) {
          acc[item.character.name] = item.respawn?.name || '';
        }
        return acc;
      }, {} as { [key: string]: string });
      
      const iconState = data.reduce((acc, item) => {
        if (item.character.name) {
          acc[item.character.name] = item.respawn?.is_pt ? 'true.png' : 'false.png';
        }
        return acc;
      }, {} as { [key: string]: string });

      setLocalRespawnData(respawnData);
      setLocalIconState(iconState);
      setInitialLoad(false);
    }
  }, [data, initialLoad]);

  const handleRespawnChange = (characterName: string, value: string) => {
    const updatedRespawnData = { ...localRespawnData, [characterName]: value };
    setLocalRespawnData(updatedRespawnData);
  };

  const handleRespawnBlur = async (characterName: string, value: string) => {
    try {
      if (localRespawnData[characterName]) {
        await updateRespawn(characterName, { name: value, character: characterName, is_pt: false });
        toast({
          title: 'Respawn atualizado com sucesso',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Falha ao atualizar respawn', error);
      toast({
        title: 'Falha ao atualizar respawn',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleIconClick = async (characterName: string) => {
    let updatedSelectedCharacters = [...selectedCharacters];
    if (selectedCharacters.includes(characterName)) {
      updatedSelectedCharacters = updatedSelectedCharacters.filter((name) => name !== characterName);
    } else {
      updatedSelectedCharacters.push(characterName);
    }

    if (updatedSelectedCharacters.length > 4) {
      toast({
        title: 'Máximo de 4 membros permitidos no PT.',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    setSelectedCharacters(updatedSelectedCharacters);
    const is_pt = updatedSelectedCharacters.length > 1;

    if (updatedSelectedCharacters.length <= 4) {
      try {
        const pt_members = is_pt ? updatedSelectedCharacters : [];
        for (const char of updatedSelectedCharacters) {
            await updateRespawn(char, { character: char, is_pt, pt_members });
          
        }
        toast({
          title: is_pt ? 'Personagens vinculados com sucesso' : 'Vinculação desfeita',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });

        setTimeout(() => {
          setSelectedCharacters([]);
        }, 5000);
      } catch (error) {
        console.error('Falha ao vincular personagens', error);
        toast({
          title: 'Falha ao vincular personagens',
          status: 'error',
          duration: 2000,
          isClosable: true,
        });
      }
    }

    const updatedIconState = { ...localIconState };
    for (const char of updatedSelectedCharacters) {
      updatedIconState[char] = is_pt ? 'true.png' : 'false.png';
    }
    setLocalIconState(updatedIconState);
  };

  const getTooltipText = (characterName: string) => {
    const character = data.find((char) => char.character.name === characterName);
    const linkedNames = character?.respawn?.pt_members || [];
    if (Array.isArray(linkedNames) && linkedNames.length > 0) {
      return `Personagens vinculados: ${linkedNames.join(', ')}`;
    }
    return 'Nenhum personagem vinculado';
  };


  return (
    <TableContainer>
      <Table variant="simple" size="sm" colorScheme="whiteAlpha" w="100%">
        <Thead>
          <Tr>
            {columns.map((column, index) => (
              <Th key={index} color="white" fontSize="sm" whiteSpace="nowrap">{column}</Th>
            ))}
          </Tr>
          <Tr>
            <Th colSpan={columns.length} color="white" fontSize="sm" textAlign="center">
              Total Online: {data.length}
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {isLoading && (
            <Tr>
              <Td colSpan={columns.length} textAlign="center" color="white" fontSize="sm">Carregando...</Td>
            </Tr>
          )}
          {!isLoading &&
            data.map((row, index) => {
              const characterName = row.character.name || 'Desconhecido';
              return (
                <Tr key={index} color="white">
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
                      handleCopy={(name) => handleCopy(name, toast)} 
                      copyAllNames={() => copyAllNames(data, toast)} 
                      copyAllExivas={() => copyAllExivas(data, toast)} 
                    />
                  </Td>
                  <Td color="white" fontSize="sm">{row.character.level}</Td>
                  <Td color="white" fontSize="sm">{row.character.onlineTimer}</Td>
                  <Td color="white" fontSize="sm">
                    <Input
                      value={localRespawnData[characterName] || ''}
                      onChange={(e) => handleRespawnChange(characterName, e.target.value)}
                      onBlur={(e) => handleRespawnBlur(characterName, e.target.value)}
                      size="sm-5"
                      bg="rgba(255, 255, 255, 0.2)"
                      color="white"
                    />
                  </Td>
                  <Td color="white" fontSize="sm">
                    <Tooltip label={getTooltipText(characterName)} hasArrow>
                      <img
                        src={localIconState[characterName] === 'true.png' ? 'assets/true.png' : 'assets/false.png'}
                        alt="ícone de status"
                        width="24"
                        height="24"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleIconClick(characterName)}
                      />
                    </Tooltip>
                  </Td>
                </Tr>
              );
            })}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
