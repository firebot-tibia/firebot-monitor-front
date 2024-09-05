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

const CharacterTable: React.FC<{ characters: GuildMemberResponse[], isLoading: boolean }> = ({ characters, isLoading }) => {
  const columns = useMemo(() => ['#', 'Level', 'Nome', 'Vocação', 'Tipo', 'Status', 'Tempo Online'], []);
  
  if (isLoading) {
    return (
      <Box textAlign="center" py={4}>
        <Spinner size="xl" />
      </Box>
    );
  }

  if (characters.length === 0) {
    return (
      <ChakraAlert status="info">
        <AlertIcon />
        Nenhum personagem está sendo monitorado no momento.
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
        {characters.map((character, index) => (
          <Tr key={character.Name}>
            <Td>{index + 1}</Td>
            <Td>{character.Level}</Td>
            <Td>{character.Name}</Td>
            <Td>{character.Vocation}</Td>
            <Td>{character.Kind}</Td>
            <Td>{character.OnlineStatus ? 'Online' : 'Offline'}</Td>
            <Td>{character.TimeOnline}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

const Alert: React.FC = () => {
  const [characters, setCharacters] = useState<GuildMemberResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [threshold, setThreshold] = useState(3);
  const [timeWindow, setTimeWindow] = useState(120);
  const toast = useToast();
  const { status } = useSession();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const checkThreshold = useCallback((currentCharacters: GuildMemberResponse[]) => {
    const now = Date.now();
    const recentCharacters = currentCharacters.filter(
      char => char.OnlineStatus && 
      (now - new Date(char.TimeOnline).getTime()) / 1000 <= timeWindow
    );
    
    const recentBombas = recentCharacters.filter(char => char.Kind === 'bomba');
    const recentMakers = recentCharacters.filter(char => char.Kind === 'maker');
    
    if (recentBombas.length >= threshold || recentMakers.length >= threshold) {
      const msg = `Alerta! ${recentBombas.length} bombas e ${recentMakers.length} makers logaram nos últimos ${timeWindow} segundos!`;
      toast({
        title: 'Alerta de Personagens!',
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
  }, [threshold, timeWindow, toast]);

  const handleMessage = useCallback((data: any) => {
    if (data?.enemy) {
      const newCharacters = data.enemy
        .filter((member: GuildMemberResponse) => member.Kind === 'bomba' || member.Kind === 'maker');

      setCharacters(prevCharacters => {
        const updatedCharacters = newCharacters.map((newChar: GuildMemberResponse) => {
          const existingChar = prevCharacters.find(c => c.Name === newChar.Name);
          if (existingChar && !existingChar.OnlineStatus && newChar.OnlineStatus) {
            checkThreshold([...prevCharacters, newChar]);
          }
          return newChar;
        });

        return updatedCharacters;
      });

      setIsLoading(false);
    }
  }, [checkThreshold]);

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
          <Heading as="h1" size="xl">Monitoramento de Bombas e Makers</Heading>
          <HStack>
            <Box>
              <Text mb={2}>Número de personagens para alerta:</Text>
              <Input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                min={1}
              />
            </Box>
            <Box>
              <Text mb={2}>Janela de tempo (segundos):</Text>
              <Input
                type="number"
                value={timeWindow}
                onChange={(e) => setTimeWindow(Number(e.target.value))}
                min={1}
              />
            </Box>
          </HStack>
          <Box>
            <Heading as="h2" size="lg" mb={2}>Lista de Personagens</Heading>
            {!isLoading && characters.length === 0 ? (
              <ChakraAlert status="info">
                <AlertIcon />
                Nenhum personagem está sendo monitorado no momento.
              </ChakraAlert>
            ) : (
              <CharacterTable characters={characters} isLoading={isLoading} />
            )}
          </Box>
        </VStack>
      </Box>
    </DashboardLayout>
  );
};

export default Alert;