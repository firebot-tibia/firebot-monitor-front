import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import {
  Box, Input, VStack, HStack, Text, useToast, Checkbox, CheckboxGroup
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

export const BombaMakerMonitor: React.FC<BombaMakerMonitorProps> = ({ characters }) => {
  const [threshold, setThreshold] = useLocalStorage('bomba-maker-threshold', 3);
  const [timeWindow, setTimeWindow] = useLocalStorage('bomba-maker-timeWindow', 120);
  const [monitoredLists, setMonitoredLists] = useLocalStorage<string[]>('monitored-lists', ['bomba', 'maker']);
  const toast = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastAlertTimeRef = useRef<number>(0);

  const filteredCharacters = useMemo(() => 
    characters.filter(char => monitoredLists.includes(char.Kind)),
    [characters, monitoredLists]
  );

  const checkThreshold = useCallback(() => {
    const now = Date.now();
    if (now - lastAlertTimeRef.current < 60000) return;

    const recentCharacters = filteredCharacters.filter(char => 
      char.OnlineStatus && parseTimeOnline(char.TimeOnline) <= timeWindow
    );
    
    const recentCounts = monitoredLists.reduce((acc, list) => {
      acc[list] = recentCharacters.filter(char => char.Kind === list).length;
      return acc;
    }, {} as Record<string, number>);

    if (Object.values(recentCounts).some(count => count >= threshold)) {
      lastAlertTimeRef.current = now;
      const msg = `Alerta! ${Object.entries(recentCounts)
        .map(([type, count]) => `${count} ${type}`)
        .join(' e ')} logaram nos últimos ${timeWindow} segundos!`;

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
  }, [filteredCharacters, threshold, timeWindow, toast, monitoredLists]);

  useEffect(() => {
    checkThreshold();
  }, [checkThreshold]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
    }
    
  }, []);

  const handleListChange = (checkedLists: string[]) => {
    setMonitoredLists(checkedLists);
  };

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
          <Text fontSize="sm">Listas para monitorar:</Text>
          <CheckboxGroup colorScheme="green" defaultValue={monitoredLists} onChange={handleListChange}>
            <HStack>
              <Checkbox value="bomba">Bomba</Checkbox>
              <Checkbox value="maker">Maker</Checkbox>
              <Checkbox value="main">Main</Checkbox>
              <Checkbox value="fracoks">Fracoks</Checkbox>
              <Checkbox value="mwall">MWall</Checkbox>
              <Checkbox value="exitados">Exitados</Checkbox>
            </HStack>
          </CheckboxGroup>
        </Box>
      </VStack>
    </Box>
  );
};