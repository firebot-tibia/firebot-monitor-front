'use client';

import { useToast, TableContainer, Table, Thead, Tr, Th, Tbody, Td } from "@chakra-ui/react";
import { useState, useEffect, FC } from "react";
import { CharacterMenu } from "./character-menu-table";
import { getVocationIcon, handleCopy, copyAllNames, copyAllExivas } from "./utils/table.utils";
import { TableWidgetProps } from "./interface/table.interface";
import { RespawnInput } from "./respawn-input";

export const TableWidget: FC<TableWidgetProps> = ({ data, columns, isLoading }) => {
  const toast = useToast();
  const [localRespawnData, setLocalRespawnData] = useState<{ [key: string]: string }>({});
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (initialLoad) {
      const respawnData = data.reduce((acc, item) => {
        if (item.character.name) {
          acc[item.character.name] = item.respawn?.name || '';
        }
        return acc;
      }, {} as { [key: string]: string });
      
      setLocalRespawnData(respawnData);
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
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
