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

export function TableWidget({ data, columns, isLoading }: TableWidgetProps<GuildMemberDTO>) {
  const toast = useToast();
  const [respawnData, setRespawnData] = useState<{ [key: string]: string }>({});
  const [iconState, setIconState] = useState<{ [key: string]: string }>({});
  const [linkedCharacters, setLinkedCharacters] = useState<{ [key: string]: string[] }>({});
  const [lastClickTime, setLastClickTime] = useState<number | null>(null);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);

  useEffect(() => {
    const fetchRespawnData = async () => {
      try {
        const response = await axios.get('/api/respawn');
        setRespawnData(response.data);
      } catch (error) {
        console.error('Falha ao buscar dados de respawn', error);
      }
    };

    const fetchLinkedCharacters = async () => {
      try {
        const response = await axios.get('/api/linked-characters');
        setLinkedCharacters(response.data);
      } catch (error) {
        console.error('Falha ao buscar personagens vinculados', error);
      }
    };

    fetchRespawnData();
    fetchLinkedCharacters();
  }, []);

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
    setRespawnData(prev => ({ ...prev, [name]: value }));
  };

  const handleRespawnBlur = async (name: string) => {
    try {
      await axios.post('/api/respawn', { name, value: respawnData[name] });
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

    if (iconState[name] === 'true.png') {
      setIconState(prev => ({ ...prev, [name]: 'false.png' }));
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
        setIconState(prev => ({ ...prev, [name]: 'true.png' }));
      } else if (currentTime - (lastClickTime || 0) <= 5000) {
        const newSelectedCharacters = [...selectedCharacters, name];
        if (newSelectedCharacters.length <= 4) {
          setSelectedCharacters(newSelectedCharacters);
          setIconState(prev => ({ ...prev, [name]: 'true.png' }));
          if (newSelectedCharacters.length === 4) {
            for (const char of newSelectedCharacters) {
              updatedLinkedCharacters[char] = newSelectedCharacters;
            }
            setSelectedCharacters([]);
            setLastClickTime(null);
            try {
              console.log('chegou aqui')
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
      }
    }

    setLinkedCharacters(updatedLinkedCharacters);
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
                      value={respawnData[name] || ''}
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
                        src={`/assets/${iconState[name] || 'false.png'}`}
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
