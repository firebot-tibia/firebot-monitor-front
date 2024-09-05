'use client';

import { useEffect, useState, useMemo, FC, useRef } from 'react';
import { Box, Table, Thead, Tbody, Tr, Th, Td, Spinner, useToast } from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard';
import { useSession } from 'next-auth/react';

interface Character {
  id: string;
  name: string;
  vocation: string;
  kind: string;
  status: 'offline' | 'online';
  level: number;
}

const TableWidget: FC<{ columns: string[], data: Character[], isLoading: boolean }> = ({ columns, data, isLoading }) => {
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
            data?.map((character, index) => (
              <Tr 
                key={index} 
                bg={index % 2 === 0 ? 'gray.900' : 'gray.800'} 
                _hover={{ bg: 'gray.700', cursor: 'pointer' }}
              >
                <Td textAlign="center" fontWeight="bold" py={1} fontSize="xs">{index + 1}</Td>
                <Td textAlign="center" py={1} fontSize="xs">{character.level}</Td>
                <Td textAlign="left" maxW="xs" isTruncated py={1} fontSize="xs">{character.name}</Td>
                <Td textAlign="center" py={1} fontSize="xs">{character.vocation}</Td>
                <Td textAlign="center" py={1} fontSize="xs">{character.kind}</Td>
                <Td textAlign="center" py={1} fontSize="xs">{character.status}</Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </Box>
  );
};

const Home: FC = () => {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [monitoredBombas, setMonitoredBombas] = useState<Character[]>([]);
    const { data: session, status } = useSession();
    const toast = useToast();
    const bombaThreshold = 3;

  useEffect(() => {
    if (status === 'authenticated' && session?.access_token) {
      const token = encodeURIComponent(session.access_token);
      const sseUrl = `https://api.firebot.run/subscription/enemy/?token=${token}`;
      const eventSource = new EventSource(sseUrl);

      eventSource.onmessage = function (event) {
        const data = JSON.parse(event.data);

        if (data?.characters) {
          const newCharacters = data.characters.map((char: any) => ({
            ...char,
            status: char.status as 'offline' | 'online',
          }));

          newCharacters.forEach((char: Character) => {
            const existingChar = characters.find(c => c.id === char.id);
            if (existingChar && existingChar.status === 'offline' && char.status === 'online') {
              if (audioRef.current) {
                audioRef.current.play().catch((error) => {
                  console.log('Erro ao tocar o áudio:', error);
                });
              }
              toast({
                title: 'Personagem Logou!',
                description: `${char.name} agora está online.`,
                status: 'info',
                duration: 3000,
                isClosable: true,
              });
            }
          });

          setCharacters(newCharacters);

          const onlineBombas = newCharacters.filter((char: any) => char.Kind === 'bomba' && char.status === 'online');
          setMonitoredBombas(onlineBombas);

          if (onlineBombas.length >= bombaThreshold) {
            toast({
              title: 'Alerta de Bombas!',
              description: `Mais de ${bombaThreshold} bombas logaram ao mesmo tempo!`,
              status: 'warning',
              duration: 5000,
              isClosable: true,
            });
          }
        }

        setIsLoading(false);
      };

      eventSource.onerror = function (event) {
        console.error('Erro ocorreu:', event);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    }
  }, [status, session, characters, toast]);

  const columns = useMemo(() => ['#', 'Level', 'Nome', 'Vocação', 'Tipo', 'Status'], []);

  return (
    <DashboardLayout>
      <Box p={4}>
        <audio ref={audioRef} src="/assets/notification_sound.mp3" />
        <TableWidget
          columns={columns}
          data={characters}
          isLoading={isLoading}
        />
      </Box>
    </DashboardLayout>
  );
};

export default Home;
