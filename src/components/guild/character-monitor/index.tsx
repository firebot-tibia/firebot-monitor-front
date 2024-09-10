import React, {useCallback, useRef, useEffect, useMemo } from 'react';
import {
  Box, Table, Thead, Tbody, Tr, Th, Td, Spinner,
  Input, VStack, HStack, Text, Alert, AlertIcon,
  useToast,
} from '@chakra-ui/react';
import { GuildMemberResponse } from '../../../shared/interface/guild-member.interface';
import { useLocalStorage } from '../../../hooks/useLocalStorage';

interface BombaMakerMonitorProps {
  characters: GuildMemberResponse[];
  isLoading: boolean;
}

const parseTimeOnline = (timeOnline: string): number => {
  const parts = timeOnline.split(':').map(Number);
  return parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : 0;
};

export const BombaMakerMonitor: React.FC<BombaMakerMonitorProps> = ({ characters, isLoading }) => {
  const [threshold, setThreshold] = useLocalStorage('bomba-maker-threshold', 3);
  const [timeWindow, setTimeWindow] = useLocalStorage('bomba-maker-timeWindow', 120);
  const toast = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastAlertTimeRef = useRef<number>(0);

  const filteredCharacters = useMemo(() => 
    characters.filter(char => char.Kind === 'bomba' || char.Kind === 'maker'),
    [characters]
  );

  const checkThreshold = useCallback(() => {
    const now = Date.now();
    if (now - lastAlertTimeRef.current < 60000) return;

    const recentCharacters = filteredCharacters.filter(char => 
      char.OnlineStatus && parseTimeOnline(char.TimeOnline) <= timeWindow
    );
    
    const recentBombas = recentCharacters.filter(char => char.Kind === 'bomba');
    const recentMakers = recentCharacters.filter(char => char.Kind === 'maker');

    if (recentBombas.length >= threshold || recentMakers.length >= threshold) {
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
        utterance.lang = 'pt-BR';
        utterance.voice = speechSynthesis.getVoices().find(voice => voice.lang === 'pt-BR') || null;
        speechSynthesis.speak(utterance);
      }

      if (audioRef.current) {
        audioRef.current.play().catch(error => console.error('Failed to play audio:', error));
      }
    }
  }, [filteredCharacters, threshold, timeWindow, toast]);

  useEffect(() => {
    checkThreshold();
  }, [checkThreshold]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
    }
    
    speechSynthesis.onvoiceschanged = () => {
      console.log('Available voices:', speechSynthesis.getVoices());
    };
  }, []);

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
      </VStack>
    </Box>
  );
};