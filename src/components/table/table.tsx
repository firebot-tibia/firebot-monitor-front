'use client';

import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  Input,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
} from '@chakra-ui/react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useState, useEffect, FC } from 'react';

import { ChevronDownIcon } from '@chakra-ui/icons';
import { vocationIcons } from '../../constant/constant';
import { postRespawn, updateRespawn } from '../../services/respawn';

export interface TableWidgetProps<T> {
  data: T[];
  columns: string[];
  isLoading: boolean;
  respawnData: { [key: string]: string };
  iconState: { [key: string]: string };
}

function getVocationIcon(vocation: string) {
  return vocationIcons[vocation] || '';
}

function getName(name: string | undefined): string {
  return name || 'Desconhecido';
}

const CharacterMenu: FC<{ characterName: string, handleCopy: (name: string | undefined) => void, copyAllNames: () => void, copyAllExivas: () => void }> = ({ characterName, handleCopy, copyAllNames, copyAllExivas }) => (
  <Menu>
    <MenuButton as={Button} size="xs" rightIcon={<ChevronDownIcon />} bg="transparent" _hover={{ bg: 'transparent' }}>
      {characterName}
    </MenuButton>
    <MenuList bg="black" color="white">
      <CopyToClipboard text={`exiva "${characterName}"`}>
        <MenuItem _hover={{ bg: 'gray.700' }} onClick={() => handleCopy(characterName)}>Copiar exiva</MenuItem>
      </CopyToClipboard>
      <CopyToClipboard text={characterName}>
        <MenuItem _hover={{ bg: 'gray.700' }} onClick={() => handleCopy(characterName)}>Copiar nome</MenuItem>
      </CopyToClipboard>
      <MenuItem _hover={{ bg: 'gray.700' }} onClick={copyAllNames}>Copiar todos os nomes</MenuItem>
      <MenuItem _hover={{ bg: 'gray.700' }} onClick={copyAllExivas}>Copiar todos os exivas</MenuItem>
    </MenuList>
  </Menu>
);

export function TableWidget({ data, columns, isLoading, respawnData, iconState }: TableWidgetProps<GuildMemberDTO>) {
  const toast = useToast();
  const [localRespawnData, setLocalRespawnData] = useState<{ [key: string]: string }>({});
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [localIconState, setLocalIconState] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialLoad) {
      setLocalRespawnData(respawnData);
      setLocalIconState(iconState);
      setInitialLoad(false);
    }
  }, [respawnData, iconState, initialLoad]);

  const handleCopy = (name: string | undefined) => {
    const displayName = getName(name);
    toast({
      title: `"${displayName}" copiado para a área de transferência.`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleRespawnChange = (characterName: string, value: string) => {
    const updatedRespawnData = { ...localRespawnData, [characterName]: value };
    setLocalRespawnData(updatedRespawnData);
  };

  const handleRespawnBlur = async (characterName: string, value: string) => {
    try {
      if (respawnData[characterName]) {
        await updateRespawn(characterName, { name: value, character: characterName, is_pt: false });
        toast({
          title: 'Respawn atualizado com sucesso',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        await postRespawn({ name: value, character: characterName, is_pt: false });
        toast({
          title: 'Respawn registrado com sucesso',
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

    if (updatedSelectedCharacters.length <= 4) {
      try {
        const is_pt = updatedSelectedCharacters.length > 1;
        const pt_members = is_pt ? updatedSelectedCharacters : [];
        for (const char of updatedSelectedCharacters) {
          const existingRespawn = respawnData[char];
          if (existingRespawn) {
            await updateRespawn(char, { character: char, is_pt, pt_members });
          } else {
            await postRespawn({ name: char, character: char, is_pt, pt_members });
          }
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
    const character = data.find((char) => char.name === characterName);
    const linkedNames = character?.pt_members || [];
    if (Array.isArray(linkedNames) && linkedNames.length > 0) {
      return `Personagens vinculados: ${linkedNames.join(', ')}`;
    }
    return 'Nenhum personagem vinculado';
  };

  const copyAllNames = () => {
    const allNames = data.map(row => row.name).join(', ');
    navigator.clipboard.writeText(allNames);
    toast({
      title: 'Todos os nomes copiados para a área de transferência.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const copyAllExivas = () => {
    const allExivas = data.map(row => `exiva "${row.name}"`).join('\n');
    navigator.clipboard.writeText(allExivas);
    toast({
      title: 'Todos os exivas copiados para a área de transferência.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
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
              <Button ml={4} size="xs" onClick={copyAllNames} colorScheme="teal">
                Copiar todos os nomes
              </Button>
              <Button ml={2} size="xs" onClick={copyAllExivas} colorScheme="teal">
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
          {!isLoading &&
            data.map((row, index) => {
              const characterName = row.name || 'Desconhecido';
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
                    <CharacterMenu 
                      characterName={characterName} 
                      handleCopy={handleCopy} 
                      copyAllNames={copyAllNames} 
                      copyAllExivas={copyAllExivas} 
                    />
                  </Td>
                  <Td color="white" fontSize="sm">{row.level}</Td>
                  <Td color="white" fontSize="sm">{row.onlineTimer}</Td>
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
