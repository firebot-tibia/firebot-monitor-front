'use client';

import { Table, TableContainer, Tbody, Td, Th, Thead, Tr, useToast, Input, Tooltip } from '@chakra-ui/react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { GuildMemberDTO } from '../dtos/guild.dto';

export interface TableWidgetProps<T> {
  data: T[];
  columns: string[];
  isLoading: boolean;
  respawnData: { [key: string]: string };
  iconState: { [key: string]: string };
}

const vocationIcons: { [key: string]: string } = {
  'Master Sorcerer': '/assets/ms.gif',
  'Sorcerer': '/assets/ms.gif',
  'Royal Paladin': '/assets/rp.gif',
  'Paladin': '/assets/rp.gif',
  'Elite Knight': '/assets/ek.gif',
  'Knight': '/assets/ek.gif',
  'Elder Druid': '/assets/ed.gif',
  'Druid': '/assets/ed.gif',
};

function getVocationIcon(vocation: string) {
  return vocationIcons[vocation] || '';
}

function getName(name: string | undefined): string {
  return name || 'Desconhecido';
}

export function TableWidget({ data, columns, isLoading, respawnData, iconState }: TableWidgetProps<GuildMemberDTO>) {
  const toast = useToast();
  const [localRespawnData, setLocalRespawnData] = useState<{ [key: string]: string }>(respawnData);
  const [localIconState, setLocalIconState] = useState<{ [key: string]: string }>(iconState);
  const [linkedCharacters, setLinkedCharacters] = useState<{ [key: string]: string[] }>({});
  const [lastClickTime, setLastClickTime] = useState<number | null>(null);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);

  useEffect(() => {
    setLocalRespawnData(respawnData);
    setLocalIconState(iconState);
  }, [respawnData, iconState]);

  const handleCopy = (name: string | undefined) => {
    const displayName = getName(name);
    toast({
      title: `"exiva ${displayName}" copiado para a área de transferência.`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleRespawnChange = (name: string, value: string) => {
    const updatedRespawnData = { ...localRespawnData, [name]: value };
    setLocalRespawnData(updatedRespawnData);
    axios.post('/api/respawn', { type: 'respawn', name, value });
  };

  const handleRespawnBlur = async (name: string) => {
    try {
      await axios.post('/api/respawn', { type: 'respawn', name, value: localRespawnData[name] });
      toast({
        title: 'Respawn atualizado com sucesso',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
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

  const handleIconClick = async (name: string) => {
    const currentTime = Date.now();
    let updatedLinkedCharacters = { ...linkedCharacters };
    let updatedIconState = { ...localIconState };

    if (localIconState[name] === 'true.png') {
      updatedIconState[name] = 'false.png';
      setSelectedCharacters([]);
      for (const key in updatedLinkedCharacters) {
        if (updatedLinkedCharacters[key].includes(name)) {
          updatedLinkedCharacters[key] = updatedLinkedCharacters[key].filter(char => char !== name);
        }
      }
    } else {
      if (selectedCharacters.length === 0) {
        setSelectedCharacters([name]);
        setLastClickTime(currentTime);
        updatedIconState[name] = 'true.png';
      } else if (currentTime - (lastClickTime || 0) <= 5000) {
        const newSelectedCharacters = [...selectedCharacters, name];
        if (newSelectedCharacters.length <= 4) {
          setSelectedCharacters(newSelectedCharacters);
          updatedIconState[name] = 'true.png';
          if (newSelectedCharacters.length === 4) {
            for (const char of newSelectedCharacters) {
              updatedLinkedCharacters[char] = newSelectedCharacters;
            }
            setSelectedCharacters([]);
            setLastClickTime(null);
            try {
              await axios.post('/api/linked-characters', { name: newSelectedCharacters[0], value: newSelectedCharacters });
              toast({
                title: 'Personagens vinculados atualizados com sucesso',
                status: 'success',
                duration: 2000,
                isClosable: true,
              });
            } catch (error) {
              console.error('Falha ao atualizar personagens vinculados', error);
              toast({
                title: 'Falha ao atualizar personagens vinculados',
                status: 'error',
                duration: 2000,
                isClosable: true,
              });
            }
          }
        }
      } else {
        setSelectedCharacters([name]);
        setLastClickTime(currentTime);
        updatedIconState[name] = 'true.png';
      }
    }

    setLocalIconState(updatedIconState);
    setLinkedCharacters(updatedLinkedCharacters);
    axios.post('/api/respawn', { type: 'icon', name, value: updatedIconState[name] });
  };

  const getTooltipText = (name: string) => {
    const linkedNames = linkedCharacters[name];
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
        </Thead>
        <Tbody>
          {isLoading && (
            <Tr>
              <Td colSpan={columns.length} textAlign="center" color="white" fontSize="sm">Carregando...</Td>
            </Tr>
          )}
          {!isLoading &&
            data.map((row, index) => {
              const name = row.name || 'Desconhecido';
              return (
                <Tr key={index} color="white">
                  <Td color="white" fontSize="sm">
                    <img
                      src={getVocationIcon(row.vocation || '')}
                      alt={row.vocation || 'Desconhecido'}
                      width="24"
                      height="24"
                    />
                  </Td>
                  <Td color="white" fontSize="sm">
                    <CopyToClipboard text={`exiva "${name}"`}>
                      <span
                        onClick={() => handleCopy(name)}
                        style={{ cursor: 'pointer', color: 'white' }}
                      >
                        {name}
                      </span>
                    </CopyToClipboard>
                  </Td>
                  <Td color="white" fontSize="sm">{row.level}</Td>
                  <Td color="white" fontSize="sm">
                    <Input
                      value={localRespawnData[name] || ''}
                      onChange={(e) => handleRespawnChange(name, e.target.value)}
                      onBlur={() => handleRespawnBlur(name)}
                      size="sm-5"
                      bg="rgba(255, 255, 255, 0.2)"
                      color="white"
                    />
                  </Td>
                  <Td color="white" fontSize="sm">
                    <Tooltip label={getTooltipText(name)} hasArrow>
                      <img
                        src={`/assets/${localIconState[name] || 'false.png'}`}
                        alt="ícone de status"
                        width="24"
                        height="24"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleIconClick(name)}
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
