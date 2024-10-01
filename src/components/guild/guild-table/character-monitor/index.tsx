import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import {
  Box,
  VStack,
  Text,
  useToast,
  Checkbox,
  Heading,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  SimpleGrid,
  useColorModeValue
} from '@chakra-ui/react';
import { useCharacterTypesView } from '../../../../hooks/characters/types/useTypeView';
import { useLocalStorage } from '../../../../hooks/global/useLocalStorage';
import { GuildMemberResponse } from '../../../../shared/interface/guild-member.interface';
import { parseTimeOnline } from '../../../../shared/utils/utils';
import { useFlexibleLocalStorage } from '../../../../hooks/global/useFlexLocalStorage';

interface BombaMakerMonitorProps {
  characters: GuildMemberResponse[];
  isLoading: boolean;
}

export const BombaMakerMonitor: React.FC<BombaMakerMonitorProps> = ({ characters }) => {
  const [threshold, setThreshold] = useFlexibleLocalStorage<number>('bomba-maker-threshold', 3);
  const [timeWindow, setTimeWindow] = useFlexibleLocalStorage<number>('bomba-maker-timeWindow', 120);
  const [monitoredLists, setMonitoredListsRaw] = useFlexibleLocalStorage<string[]>('monitored-lists', ['bomba', 'maker']);
  const toast = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastAlertTimeRef = useRef<number>(0);
  const types = useCharacterTypesView(characters);

  const bgColor = useColorModeValue('gray.800', 'gray.900');
  const textColor = useColorModeValue('gray.100', 'gray.200');
  const inputBgColor = useColorModeValue('gray.700', 'gray.800');
  
  const setMonitoredLists = useCallback((value: string[] | ((prev: string[]) => string[])) => {
    setMonitoredListsRaw((prev) => {
      if (typeof value === 'function') {
        return value(prev);
      }
      return value;
    });
  }, [setMonitoredListsRaw]);

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
    const timer = setInterval(checkThreshold, 60000);
    return () => clearInterval(timer);
  }, [checkThreshold]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, []);

  useEffect(() => {
    setMonitoredLists(prev => prev.filter(type => types.includes(type)));
  }, [types, setMonitoredLists]);

  const handleCheckboxChange = useCallback((type: string, isChecked: boolean) => {
    setMonitoredLists(prev => 
      isChecked 
        ? [...prev, type]
        : prev.filter(t => t !== type)
    );
  }, [setMonitoredLists]);

  return (
    <Box bg={bgColor} p={4} borderRadius="md" boxShadow="md">
      <VStack spacing={6} align="stretch">
        <Heading size="sm" color={textColor}>Configurações de Monitoramento</Heading>
        
        <SimpleGrid columns={2} spacing={4}>
          <Box>
            <Text fontSize="sm" color={textColor} mb={2}>Personagens:</Text>
            <NumberInput
              value={threshold}
              onChange={(_, val) => setThreshold(val)}
              min={1}
              max={10}
              step={1}
              bg={inputBgColor}
              borderRadius="md"
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Box>
          
          <Box>
            <Text fontSize="sm" color={textColor} mb={2}>Tempo (s):</Text>
            <NumberInput
              value={timeWindow}
              onChange={(_, val) => setTimeWindow(val)}
              min={30}
              max={300}
              step={30}
              bg={inputBgColor}
              borderRadius="md"
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Box>
        </SimpleGrid>
        
        <Box>
          <Text fontSize="sm" color={textColor} mb={2}>Tipos monitorados:</Text>
          <SimpleGrid columns={3} spacing={2}>
            {types.map((type) => (
              <Checkbox
                key={type}
                size="md"
                colorScheme="blue"
                isChecked={monitoredLists.includes(type)}
                onChange={(e) => handleCheckboxChange(type, e.target.checked)}
              >
                <Text fontSize="sm" color={textColor}>{type}</Text>
              </Checkbox>
            ))}
          </SimpleGrid>
        </Box>
      </VStack>
    </Box>
  );
};