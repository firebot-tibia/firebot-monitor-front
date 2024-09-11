import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Link,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { WorldData } from '../../../shared/interface/war.interface';

interface WorldStatusTableProps {
  worlds: WorldData[];
}

const WorldStatusTable: React.FC<WorldStatusTableProps> = ({ worlds }) => {
  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Mundo</Th>
          <Th>Status</Th>
          <Th>Guild Dominante</Th>
          <Th>Guild Inimiga</Th>
          <Th>Players Dominante</Th>
          <Th>Players Inimiga</Th>
          <Th>Aliança</Th>
        </Tr>
      </Thead>
      <Tbody>
        {worlds.map((world) => (
          <Tr key={world.world}>
            <Td>
              <NextLink href={`/war/worlds/${world.world}`} passHref>
                <Link color="blue.500">{world.world}</Link>
              </NextLink>
            </Td>
            <Td>{world.status}</Td>
            <Td>{world.dominantGuild}</Td>
            <Td>{world.enemyGuild || '-'}</Td>
            <Td>{`${world.playersOnline}/${world.totalPlayersDominated}`}</Td>
            <Td>{`${world.playersOnline}/${world.totalPlayersEnemy}`}</Td>
            <Td>{world.alliance}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default WorldStatusTable;