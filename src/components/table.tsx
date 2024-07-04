'use client';

import { Table, TableContainer, Tbody, Td, Th, Thead, Tr, useToast } from '@chakra-ui/react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { GuildMemberDTO } from '../dtos/guild.dto';

export interface TableWidgetProps<T> {
  data: T[];
  columns: string[];
  isLoading: boolean;
}

const vocationIcons: { [key: string]: string } = {
  'Master Sorcerer': '/assets/ms.gif',
  'Royal Paladin': '/assets/rp.gif',
  'Elite Knight': '/assets/ek.gif',
  'Elder Druid': '/assets/ed.gif'
};

function getVocationIcon(vocation: string) {
  return vocationIcons[vocation] || '';
}

function getName(name: string | undefined): string {
  return name || 'Unknown';
}

export function TableWidget({ data, columns, isLoading }: TableWidgetProps<GuildMemberDTO>) {
  const toast = useToast();

  const handleCopy = (name: string | undefined) => {
    const displayName = getName(name);
    toast({
      title: `"exiva ${displayName}" copied to clipboard.`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <TableContainer>
      <Table variant='simple'>
        <Thead>
          <Tr>
            {columns.map((column, index) => (
              <Th key={index}>{column}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {isLoading && (
            <Tr>
              <Td colSpan={columns.length}>Carregando...</Td>
            </Tr>
          )}
          {!isLoading && data.map((row, index) => (
            <Tr key={index}>
              <Td>
                <img src={getVocationIcon(row.vocation || '')} alt={row.vocation || 'Unknown'} width="24" height="24" />
              </Td>
              <Td>
                <CopyToClipboard text={`exiva "${getName(row.name)}"`}>
                  <span onClick={() => handleCopy(row.name)} style={{ cursor: 'pointer', color: 'blue' }}>
                    {row.name}
                  </span>
                </CopyToClipboard>
              </Td>
              <Td>{row.level}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  )
}
