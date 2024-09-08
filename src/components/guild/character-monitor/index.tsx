import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box, Table, Thead, Tbody, Tr, Th, Td, Spinner,
  Input, VStack, HStack, Text, Alert, AlertIcon,
  useToast,
} from '@chakra-ui/react';
import { GuildMemberResponse } from '../../../shared/interface/guild-member.interface';

interface BombaMakerMonitorProps {
  characters: GuildMemberResponse[];
  isLoading: boolean;
}

export const BombaMakerMonitor: React.FC<BombaMakerMonitorProps> = ({ characters, isLoading }) => {
  const [threshold, setThreshold] = useState(3);
  const [timeWindow, setTimeWindow] = useState(120);
  const toast = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastAlertTimeRef = useRef<number>(0);

  const checkThreshold = useCallback((newCharacters: GuildMemberResponse[]) => {
    const now = Date.now();
    const recentCharacters = newCharacters.filter(
      char => char.OnlineStatus && 
      (now - new Date(char.TimeOnline).getTime()) / 1000 <= timeWindow
    );
    
    const recentBombas = recentCharacters.filter(char => char.Kind === 'bomba');
    const recentMakers = recentCharacters.filter(char => char.Kind === 'maker');

    if (recentBombas.length >= threshold || recentMakers.length >= threshold) {
      if (now - lastAlertTimeRef.current < 10000) return;
      lastAlertTimeRef.current = now;

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
        audioRef.current.play().catch(error => console.error('Failed to play audio:', error));
      }
    }
  }, [threshold, timeWindow, toast]);

  useEffect(() => {
    checkThreshold(characters);
  }, [characters, checkThreshold]);

  const filteredCharacters = characters.filter(char => char.Kind === 'bomba' || char.Kind === 'maker');

  return (
    <Box>
      <audio ref={audioRef} src="/assets/notification_sound.mp3" />
      <VStack spacing={4} align="stretch">
        <HStack>
          <Box>
            <Text fontSize="sm">Número de personagens para alerta:</Text>
            <Input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              min={1}
              size="sm"
            />
          </Box>
          <Box>
            <Text fontSize="sm">Janela de tempo (segundos):</Text>
            <Input
              type="number"
              value={timeWindow}
              onChange={(e) => setTimeWindow(Number(e.target.value))}
              min={1}
              size="sm"
            />
          </Box>
        </HStack>
        <Box>
          {isLoading ? (
            <Spinner />
          ) : filteredCharacters.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              Nenhuma bomba ou maker está sendo monitorada no momento.
            </Alert>
          ) : (
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Nome</Th>
                  <Th>Tipo</Th>
                  <Th>Status</Th>
                  <Th>Tempo Online</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredCharacters.map((character) => (
                  <Tr key={character.Name}>
                    <Td>{character.Name}</Td>
                    <Td>{character.Kind}</Td>
                    <Td>{character.OnlineStatus ? 'Online' : 'Offline'}</Td>
                    <Td>{character.TimeOnline}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>
      </VStack>
    </Box>
  );
};