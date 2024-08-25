'use client';

import { useEffect, useState, useMemo, FC } from 'react';
import { Box, Table, Thead, Tbody, Tr, Th, Td, Image, Input, Flex, Spinner, Grid, useToast } from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard';
import { GuildMemberResponse } from '../../shared/interface/guild-member.interface';
import { useSession } from 'next-auth/react';
import { vocationIcons, characterTypeIcons } from '../../constant/character';
import { copyExivas } from '../../shared/utils/options-utils';

const TableWidget: FC<{ columns: string[], data: GuildMemberResponse[], isLoading: boolean }> = ({ columns, data, isLoading }) => {
  const toast = useToast();
  
  return (
    <Box p={2} w="full" bg="blackAlpha.800" rounded="lg" mb={4}>
      <Table variant="simple" size="xs" colorScheme="blackAlpha">
        <Thead bg="black">
          <Tr>
            {columns.map((column, index) => (
              <Th key={index} textAlign="center" borderBottomColor="gray.600" py={1} fontSize="xs">{column}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {isLoading ? (
            <Tr>
              <Td colSpan={columns.length} textAlign="center">
                <Spinner size="sm" />
              </Td>
            </Tr>
          ) : (
            data?.map((member, index) => (
              <Tr 
                key={index} 
                bg={index % 2 === 0 ? 'gray.900' : 'gray.800'} 
                _hover={{ bg: 'gray.700', cursor: 'pointer' }} 
                onClick={() => copyExivas(member, toast)}
              >
                <Td textAlign="center" fontWeight="bold" py={1} fontSize="xs">{index + 1}</Td>
                <Td textAlign="center" py={1} fontSize="xs">{member.Level}</Td>
                <Td textAlign="center" py={1} fontSize="xs">
                  <Image src={vocationIcons[member.Vocation] || '/assets/default.png'} alt={member.Vocation} boxSize="16px" mx="auto" />
                </Td>
                <Td textAlign="left" maxW="xs" isTruncated py={1} fontSize="xs">{member.Name}</Td>
                <Td textAlign="center" py={1} fontSize="xs">
                  <Flex alignItems="center" justifyContent="center">
                    <Image src={characterTypeIcons[member.Kind] || '/assets/default.png'} alt={member.Kind} boxSize="14px" mr={2} />
                    {member.Kind || 'n/a'}
                  </Flex>
                </Td>
                <Td textAlign="center" py={1} fontSize="xs">
                  <Box as="span" display="inline-block" w={3} h={3} borderRadius="full" bg={member.OnlineStatus ? 'green.500' : 'red.500'} />
                </Td>
                <Td textAlign="center" py={1} fontSize="xs">
                  <Input
                    defaultValue={member.Local || ''}
                    bg="gray.800"
                    p={1}
                    rounded="md"
                    color="white"
                    textAlign="center"
                    w="full"
                    minW="90px"
                    fontSize="xs"
                  />
                </Td>
                <Td textAlign="center" fontFamily="monospace" py={1} fontSize="xs">{(member.TimeOnline)}</Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </Box>
  );
};

const Home: FC = () => {
  const [guildData, setGuildData] = useState<GuildMemberResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.access_token) {
      const token = encodeURIComponent(session.access_token);
      const sseUrl = `https://api.firebot.run/subscription/enemy/?token=${token}`;
      const eventSource = new EventSource(sseUrl);

      eventSource.onmessage = function (event) {
        const data = JSON.parse(event.data);
        if (data?.enemy) {
          setGuildData(data.enemy);
        }
        setIsLoading(false);
      };

      eventSource.onerror = function (event) {
        console.error('Error occurred:', event);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    }
  }, [status, session]);

  const columns = useMemo(() => ['#', 'Lvl', 'Voc', 'Nome', 'Tipo', 'Status', 'Exiva', 'Tempo'], []);

  const types = useMemo(() => ['main', 'maker', 'bomba', 'fracoks'], []);

  const sortedGuildData = useMemo(() => {
    return guildData.sort((a, b) => b.Level - a.Level || a.Vocation.localeCompare(b.Vocation));
  }, [guildData]);

  return (
    <DashboardLayout>
      <Grid w="full">
        {types.map((type) => {
          const filteredData = sortedGuildData.filter(member => member.Kind === type);
          if (filteredData.length > 0) {
            return (
              <Box key={type} w="full">
                <TableWidget
                  columns={columns}
                  data={filteredData}
                  isLoading={isLoading}
                />
              </Box>
            );
          }
          return null;
        })}
        <Box w="full">
          <TableWidget
            columns={columns}
            data={sortedGuildData.filter(member => !member.Kind)}
            isLoading={isLoading}
          />
        </Box>
      </Grid>
    </DashboardLayout>
  );
};

export default Home;
