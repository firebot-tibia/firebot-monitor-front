'use client';

import React, { useState, useEffect, useMemo, useRef, useReducer } from 'react';
import { Box, Button, Text, Spinner, useToast, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard';
import { useSession } from 'next-auth/react';

interface Death {
  id: string;
  name: string;
  level: number;
  vocation: string;
  city: string;
  death: string;
  date: Date | null;
}

const itemsPerPage = 5;

type Action =
  | { type: 'ADD_DEATH'; payload: Death }
  | { type: 'SET_DEATH_LIST'; payload: Death[] };

  function deathReducer(state: Death[], action: Action): Death[] {
    switch (action.type) {
      case 'ADD_DEATH':
        const updatedState = [action.payload, ...state];
        if (typeof window !== 'undefined') {
          localStorage.setItem('deathList', JSON.stringify(updatedState));
        }
        return updatedState;
      case 'SET_DEATH_LIST':
        if (typeof window !== 'undefined') {
          localStorage.setItem('deathList', JSON.stringify(action.payload));
        }
        return action.payload;
      default:
        return state;
    }
  }
  

const formatDate = (dateString: Date | null) => {
  if (!dateString) return 'Data desconhecida';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const DeathTable = () => {
  const [deathList, dispatch] = useReducer(deathReducer, []);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDeath, setSelectedDeath] = useState<Death | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const toast = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDeaths = localStorage.getItem('deathList');
      if (savedDeaths) {
        dispatch({ type: 'SET_DEATH_LIST', payload: JSON.parse(savedDeaths) });
      }
      const savedAudioEnabled = localStorage.getItem('audioEnabled') === 'true';
      setAudioEnabled(savedAudioEnabled);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && session?.access_token) {
      const token = encodeURIComponent(session.access_token);
      const sseUrl = `https://api.firebot.run/subscription/enemy/?token=${token}`;
      const eventSource = new EventSource(sseUrl);

      eventSource.onmessage = function (event) {
        const data = JSON.parse(event.data);
        if (data?.death) {
          const newDeath: Death = {
            ...data.death,
            id: `${data.death.name}-${Date.now()}`,
            date: new Date(data.death.date || Date.now()),
            death: data.death.text,
          };
          dispatch({ type: 'ADD_DEATH', payload: newDeath });

          toast({
            title: 'Nova morte registrada!',
            description: `${newDeath.name} morreu para ${newDeath.death}.`,
            status: 'info',
            duration: 5000,
            isClosable: true,
          });

          if (audioEnabled && audioRef.current) {
            audioRef.current.play().catch((error) => {
              console.log('Erro ao tocar o áudio:', error);
            });
          }

          if (!selectedDeath) {
            setSelectedDeath(newDeath);
          }
        }
        setIsLoading(false);
      };

      eventSource.onerror = function (event) {
        console.error('Erro ao se conectar ao SSE:', event);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    }
  }, [status, session, selectedDeath, toast, audioEnabled]);

  const recentDeaths = useMemo(() => {
    const now = Date.now();
    return deathList
      .filter(death => {
        const deathTime = death.date ? new Date(death.date).getTime() : now;
        return now - deathTime < 12 * 60 * 60 * 1000;
      })
      .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());
  }, [deathList]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('audioEnabled', String(audioEnabled));
    }
  }, [audioEnabled]);

  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentData = recentDeaths.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(recentDeaths.length / itemsPerPage);

  const handleClick = (death: Death) => {
    setSelectedDeath(death);
  };

  const enableAudio = () => {
    setAudioEnabled(true);
  };

  return (
    <DashboardLayout>
      <Box p={4}>
        <audio ref={audioRef} src="/assets/notification_sound.mp3" />
        {!audioEnabled && (
          <Button onClick={enableAudio} mb={4}>
            Habilitar Alerta
          </Button>
        )}
        <Text fontSize="2xl" mb={4} textAlign="center">Mortes Recentes</Text>
        <Box overflowX="auto">
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Spinner size="xl" />
            </Box>
          ) : currentData.length === 0 ? (
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
                  <Th>Data</Th>
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
                    <Td>{formatDate(death.date)}</Td>
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
    <Text><strong>Data:</strong> {formatDate(death.date)}</Text>
  </Box>
);

export default DeathTable;
