'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  useToast,
  Input,
  VStack,
  HStack,
  Text,
  Heading,
  Alert as ChakraAlert,
  AlertIcon,
} from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard';
import { useSession } from 'next-auth/react';
import { useEventSource } from '../../hooks/useEvent';
import { GuildMemberResponse } from '../../shared/interface/guild-member.interface';

const BombaTable: React.FC<{ bombas: GuildMemberResponse[], isLoading: boolean }> = ({ bombas, isLoading }) => {
  const columns = useMemo(() => ['#', 'Level', 'Nome', 'Vocação', 'Status', 'Tempo Online'], []);
  if (isLoading) {
    return (
      <Box textAlign="center" py={4}>
        <Spinner size="xl" />
      </Box>
    );
  }

  if (bombas.length === 0) {
    return (
      <ChakraAlert status="info">
        <AlertIcon />
        Nenhuma bomba está sendo monitorada no momento.
      </ChakraAlert>
    );
  }

  return (
    <Table variant="simple" size="sm">
      <Thead>
        <Tr>
          {columns.map((column) => (
            <Th key={column}>{column}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {bombas.map((bomba, index) => (
          <Tr key={bomba.Name}>
            <Td>{index + 1}</Td>
            <Td>{bomba.Level}</Td>
            <Td>{bomba.Name}</Td>
            <Td>{bomba.Vocation}</Td>
            <Td>{bomba.OnlineStatus ? 'Online' : 'Offline'}</Td>
            <Td>{bomba.TimeOnline}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

const Alert: React.FC = () => {
  const [bombas, setBombas] = useState<GuildMemberResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bombaThreshold, setBombaThreshold] = useState(3);
  const [bombaTimeWindow, setBombaTimeWindow] = useState(120);
  const toast = useToast();
  const { status } = useSession();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const checkBombaThreshold = useCallback((currentBombas: GuildMemberResponse[]) => {
    const now = Date.now();
    const recentBombas = currentBombas.filter(
      bomba => bomba.OnlineStatus && 
      (now - new Date(bomba.TimeOnline).getTime()) / 1000 <= bombaTimeWindow
    );
    
    if (recentBombas.length >= bombaThreshold) {
      const msg = `${recentBombas.length} bombas logaram nos últimos ${bombaTimeWindow} segundos!`;
      toast({
        title: 'Alerta de Bombas!',
        description: msg,
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(msg);
        speechSynthesis.speak(utterance);
      }

      if (audioRef.current) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [bombaThreshold, bombaTimeWindow, toast]);

  const handleMessage = useCallback((data: any) => {
    if (data?.enemy) {
      const newBombas = data.enemy
        .filter((member: GuildMemberResponse) => member.Kind === 'bomba');

      setBombas(prevBombas => {
        const updatedBombas = newBombas.map((newBomba: GuildMemberResponse) => {
          const existingBomba = prevBombas.find(b => b.Name === newBomba.Name);
          if (existingBomba && !existingBomba.OnlineStatus && newBomba.OnlineStatus) {
            checkBombaThreshold([...prevBombas, newBomba]);
          }
          return newBomba;
        });

        return updatedBombas;
      });

      setIsLoading(false);
    }
  }, [checkBombaThreshold]);

  const { error } = useEventSource(
    status === 'authenticated' ? `https://api.firebot.run/subscription/enemy/` : null,
    handleMessage
  );

  useEffect(() => {
    if (error) {
      toast({
        title: 'Erro de conexão',
        description: `Houve um problema ao conectar com o servidor: ${error.message}. Tentando reconectar...`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [error, toast]);

  return (
    <DashboardLayout>
      <Box p={4}>
        <audio ref={audioRef} src="/assets/alert_sound.mp3" />
        <VStack spacing={4} align="stretch">
          <Heading as="h1" size="xl">Monitoramento de Bombas</Heading>
          <HStack>
            <Box>
              <Text mb={2}>Número de bombas para alerta:</Text>
              <Input
                type="number"
                value={bombaThreshold}
                onChange={(e) => setBombaThreshold(Number(e.target.value))}
                min={1}
              />
            </Box>
            <Box>
              <Text mb={2}>Janela de tempo (segundos):</Text>
              <Input
                type="number"
                value={bombaTimeWindow}
                onChange={(e) => setBombaTimeWindow(Number(e.target.value))}
                min={1}
              />
            </Box>
          </HStack>
          <Box>
            <Heading as="h2" size="lg" mb={2}>Lista de Bombas</Heading>
            {!isLoading && bombas.length === 0 ? (
              <ChakraAlert status="info">
                <AlertIcon />
                Nenhuma bomba está sendo monitorada no momento.
              </ChakraAlert>
            ) : (
              <BombaTable bombas={bombas} isLoading={isLoading} />
            )}
          </Box>
        </VStack>
      </Box>
    </DashboardLayout>
  );
};

export default Alert;