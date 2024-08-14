'use client'

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Grid,
  GridItem,
  Container,
  Card,
  CardBody,
  Image,
  Box,
} from '@chakra-ui/react';
import { useEffect, useState, useMemo, FC, useCallback } from 'react';
import DashboardLayout from '../../components/dashboard';
import { GuildMemberResponse } from '../../shared/interface/guild-member.interface';
import { CharacterType } from '../../shared/enum/character-type.enum';
import { useToastContext } from '../../context/toast/toast-context';
import { characterTypeIcons, vocationIcons } from '../../constant/character';
import io from 'socket.io-client';
import Cookies from 'js-cookie';
import { useSession } from 'next-auth/react';

const TableWidget: FC<{ columns: string[], data: GuildMemberResponse[], isLoading: boolean }> = ({ columns, data, isLoading }) => (
  <Table variant="simple" size="sm" colorScheme="gray" style={{ tableLayout: 'fixed', width: '100%' }}>
    <Thead>
      <Tr>
        {columns.map((column, index) => (
          <Th key={index} color="white" textAlign="center" fontSize="sm">{column}</Th>
        ))}
      </Tr>
    </Thead>
    <Tbody>
      {isLoading ? (
        <Tr>
          <Td colSpan={columns.length} textAlign="center">
            <Spinner size="lg" />
          </Td>
        </Tr>
      ) : (
        data.map((member, index) => (
          <Tr key={index}>
            <Td textAlign="center" color="white">{index + 1}</Td>
            <Td textAlign="center" color="white">{member.level}</Td>
            <Td textAlign="center" color="white">
              <Image src={vocationIcons[member.vocation] || '/assets/default.png'} alt={member.vocation} boxSize="24px" mx="auto" />
            </Td>
            <Td textAlign="left" color="white" isTruncated maxW="150px">{member.name}</Td>
            <Td textAlign="center" color="white">
              <Image src={characterTypeIcons[member.kind as CharacterType]} alt={member.kind} boxSize="24px" mx="auto" />
            </Td>
            <Td textAlign="center" color="white">{member.status}</Td>
            <Td textAlign="center" color="white" maxW="150px" isTruncated>{member.onlineStatus ? "Online" : "Offline"}</Td>
          </Tr>
        ))
      )}
    </Tbody>
  </Table>
);

const Home: FC = () => {
  const [guildData, setGuildData] = useState<GuildMemberResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToastContext();
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || '';
  const token = useSession();

  useEffect(() => {
    console.log('Token:', token.data);
    const socketUrl = `ws://api.firebot.run/ws/enemy?token=${encodeURIComponent(token.data?.user.access_token ?? '')}`;

    const socket = io(socketUrl, {
      transports: ['websocket'],
      path: `/ws/enemy`,
    });

    socket.on('connect', () => {
      console.log('Socket.io connection established');
    });

    socket.on('enemy', (data: GuildMemberResponse[]) => {
      console.log('Received data:', data);
      setGuildData(data);
      setIsLoading(false);
    });

    socket.on('error', (error) => {
      console.error('error', error);
    });

    socket.on('disconnect', () => {
      console.log('Socket.io connection closed');
    });

    return () => {
      socket.disconnect();
    };
  }, [socketUrl, showToast, token]);

  const columns = useMemo(() => ['#', 'Lvl', 'Voc', 'Nome', 'Tipo', 'Tempo', 'Exiva'], []);

  const filterCharactersByType = useCallback((type: string) => {
    return guildData.filter((item) => item.kind === type);
  }, [guildData]);

  return (
    <DashboardLayout>
      <Container className="p-8" maxW="full" display="flex" flexDirection="column" gap="7">
        <Card bg="rgba(255, 255, 255, 0.2)" backdropFilter="blur(10px)">
          <CardBody>
            <Grid templateColumns="repeat(2, 1fr)" gap="7">
              <GridItem>
                <Box overflowX="auto">
                  <TableWidget
                    columns={columns}
                    data={filterCharactersByType('main')}
                    isLoading={isLoading}
                  />
                </Box>
              </GridItem>
              <GridItem>
                <Box overflowX="auto">
                  <TableWidget
                    columns={columns}
                    data={filterCharactersByType('maker')}
                    isLoading={isLoading}
                  />
                </Box>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>
      </Container>
    </DashboardLayout>
  );
};

export default Home;
