'use client';

import { Table, TableContainer, Tbody, Td, Th, Thead, Tr, useToast, Input } from '@chakra-ui/react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useState, useEffect } from 'react';
import { GuildMemberDTO } from '../dtos/guild.dto';
import axios from 'axios';

export interface TableWidgetProps<T> {
  data: T[];
  columns: string[];
  isLoading: boolean;
}

const vocationIcons: { [key: string]: string } = {
  'Master Sorcerer': '/assets/ms.gif',
  'Royal Paladin': '/assets/rp.gif',
  'Elite Knight': '/assets/ek.gif',
  'Elder Druid': '/assets/ed.gif',
};

function getVocationIcon(vocation: string) {
  return vocationIcons[vocation] || '';
}

function getName(name: string | undefined): string {
  return name || 'Unknown';
}

export function TableWidget({ data, columns, isLoading }: TableWidgetProps<GuildMemberDTO>) {
  const toast = useToast();
  const [respawnData, setRespawnData] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchRespawnData = async () => {
      try {
        const response = await axios.get('/api/respawn');
        setRespawnData(response.data);
      } catch (error) {
        console.error('Failed to fetch respawn data', error);
      }
    };

    fetchRespawnData();
  }, []);

  const handleCopy = (name: string | undefined) => {
    const displayName = getName(name);
    toast({
      title: `"exiva ${displayName}" copied to clipboard.`,
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
        title: 'Respawn updated successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to update respawn', error);
      toast({
        title: 'Failed to update respawn',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
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
              const name = row.name || 'Unknown';
              return (
                <Tr key={index} color="white">
                  <Td color="white" fontSize="sm">
                    <img
                      src={getVocationIcon(row.vocation || '')}
                      alt={row.vocation || 'Unknown'}
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
                      size="sm"
                      bg="rgba(255, 255, 255, 0.2)"
                      color="white"
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
