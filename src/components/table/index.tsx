'use client';

import { Table, TableContainer, Tbody, Td, Th, Thead, Tr, useToast, Button } from '@chakra-ui/react';
import { useState, useEffect, FC } from 'react';
import { vocationIcons } from '../../constant/constant';
import { TableWidgetProps } from './interface/table.interface';
import { CharacterMenu } from './character-menu-table';
import { PTIcon } from './pt-icon';
import { RespawnInput } from './respawn-input';
import { copyAllNames, copyAllExivas } from './utils/table.utils';

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
              <Button ml={4} size="xs" onClick={() => copyAllNames(data, toast)} colorScheme="teal">
                Copiar todos os nomes
              </Button>
              <Button ml={2} size="xs" onClick={() => copyAllExivas(data, toast)} colorScheme="teal">
                Copiar todos os exivas
              </Button>
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {isLoading && (
            <Tr>
              <Td colSpan={columns.length} textAlign="center" color="white" fontSize="sm">Carregando...</Td>
            </Tr>
          )}
          {!isLoading && data.map((row, index) => {
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
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

function getVocationIcon(vocation: string) {
  return vocationIcons[vocation] || '';
}

function handleCopy(name: string | undefined, toast: any) {
  const displayName = getName(name);
  toast({
    title: `"${displayName}" copiado para a área de transferência.`,
    status: 'success',
    duration: 2000,
    isClosable: true,
  });
}

function getName(name: string | undefined): string {
  return name || 'Desconhecido';
}
