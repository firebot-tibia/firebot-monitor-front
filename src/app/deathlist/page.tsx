'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, Box, Text, Button, Spinner, useToast } from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard';
import { useSession } from 'next-auth/react';

interface Death {
  id: string;
  name: string;
  level: number;
  vocation: string;
  city: string;
  death: string;
  timestamp: number;
}

const itemsPerPage = 5;

const DeathTable = () => {
  const [deathList, setDeathList] = useState<Death[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDeath, setSelectedDeath] = useState<Death | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const toast = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.access_token) {
      const token = encodeURIComponent(session.access_token);
      const sseUrl = `https://api.firebot.run/subscription/enemy/?token=${token}`;
      const eventSource = new EventSource(sseUrl);

      eventSource.onmessage = function (event) {
        const data = JSON.parse(event.data);
        console.log('Event received:', data);
        if (data?.death) {
          const newDeath = {
            ...data.death,
            id: `${data.death.name}-${Date.now()}`,
            timestamp: Date.now(),
          };
          setDeathList((prevDeathList) => [
            ...prevDeathList,
            newDeath,
          ]);

          if (audioRef.current) {
            audioRef.current.play();
          }

          toast({
            title: 'Nova morte registrada!',
            description: `${newDeath.name} morreu em ${newDeath.city} para ${newDeath.death}.`,
            status: 'info',
            duration: 5000,
            isClosable: true,
          });

          if (!selectedDeath) {
            setSelectedDeath(data.death);
          }
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
  }, [status, session, selectedDeath, toast]);

  const recentDeaths = useMemo(() => {
    const now = Date.now();
    return deathList.filter(death => now - death.timestamp < 24 * 60 * 60 * 1000);
  }, [deathList]);

  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentData = recentDeaths.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(recentDeaths.length / itemsPerPage);

  const handleClick = (death: Death) => {
    setSelectedDeath(death);
  };

  return (
    <DashboardLayout>
      <Box p={4}>
        <audio ref={audioRef} src="assets/notification_sound.mp3" />
        <Text fontSize="2xl" mb={4} textAlign="center">Mortes Recentes</Text>
        <Box overflowX="auto">
          {isLoading ? (
            <Spinner size="xl" />
          ) : recentDeaths.length === 0 ? (
            <Text textAlign="center" fontSize="lg">Sem mortes recentes</Text>
          ) : (
            <Table variant="simple" colorScheme="gray">
              <Thead>
                <Tr>
                  <Th>Nome</Th>
                  <Th>Level</Th>
                  <Th>Vocação</Th>
                  <Th>Cidade</Th>
                  <Th>Morte</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentData.map((death) => (
                  <Tr
                    key={death.id}
                    onClick={() => handleClick(death)}
                    _hover={{ bg: 'gray.600', cursor: 'pointer' }}
                  >
                    <Td>{death.name}</Td>
                    <Td>{death.level}</Td>
                    <Td>{death.vocation}</Td>
                    <Td>{death.city}</Td>
                    <Td>{death.death}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>
        {recentDeaths.length > 0 && (
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={4}>
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Anterior
            </Button>
            <Text>Página {currentPage} de {totalPages}</Text>
            <Button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Próxima
            </Button>
          </Box>
        )}
        {selectedDeath && <DeathDetail death={selectedDeath} />}
      </Box>
    </DashboardLayout>
  );
};

const DeathDetail: React.FC<{ death: Death }> = ({ death }) => (
  <Box mt={6} p={4} borderWidth="1px" borderRadius="lg" overflow="hidden" bg="gray.700">
    <Text fontSize="xl" fontWeight="bold">Detalhes da Morte</Text>
    <Text><strong>Nome:</strong> {death.name}</Text>
    <Text><strong>Level:</strong> {death.level}</Text>
    <Text><strong>Vocação:</strong> {death.vocation}</Text>
    <Text><strong>Cidade:</strong> {death.city}</Text>
    <Text><strong>Morte:</strong> {death.death}</Text>
  </Box>
);

export default DeathTable;
