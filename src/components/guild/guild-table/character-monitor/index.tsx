import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  useToast,
  Checkbox,
  Heading,
  Input,
  SimpleGrid,
  useColorModeValue,
  Flex,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { GuildMemberResponse } from '../../../../shared/interface/guild/guild-member.interface';
import { parseTimeOnline } from '../../../../shared/utils/utils';
import { useFlexibleLocalStorage } from '../../../../shared/hooks/useFlexLocalStorage';
import { useCharacterTypesView } from '../../../../shared/hooks/useTypeView';
import { useAudio } from '../../../../shared/hooks/useAudio';

interface BombaMakerMonitorProps {
  characters: GuildMemberResponse[];
  isLoading: boolean;
}

export const BombaMakerMonitor: React.FC<BombaMakerMonitorProps> = ({ characters }) => {
  const [threshold, setThreshold] = useFlexibleLocalStorage<number>('bomba-maker-threshold', 3);
  const [timeWindow, setTimeWindow] = useFlexibleLocalStorage<number>('bomba-maker-timeWindow', 120);
  const [monitoredLists, setMonitoredListsRaw] = useFlexibleLocalStorage<string[]>('monitored-lists', ['bomba', 'maker']);
  const toast = useToast();
  const lastAlertTimeRef = useRef<number>(0);
  const types = useCharacterTypesView(characters);
  const { audioEnabled, playAudio } = useAudio('/assets/notification_sound.mp3');

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
    }
  }, [filteredCharacters, threshold, timeWindow, toast, monitoredLists, audioEnabled, playAudio]);

  useEffect(() => {
    const timer = setInterval(checkThreshold, 10000);
    return () => clearInterval(timer);
  }, [checkThreshold]);

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
    <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="xl">
      <VStack spacing={6} align="stretch">
        <Heading size="md" color={textColor}>Configurações de Monitoramento</Heading>
        
        <Flex direction={{ base: "column", md: "row" }} gap={4}>
          <FormControl>
            <FormLabel htmlFor="threshold" color={textColor}>Número de Personagens</FormLabel>
            <Input
              id="threshold"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              type="number"
              min={0}
              max={10}
              bg={inputBgColor}
              color={textColor}
            />
          </FormControl>
          
          <FormControl>
            <FormLabel htmlFor="timeWindow" color={textColor}>Tempo (segundos)</FormLabel>
            <Input
              id="timeWindow"
              value={timeWindow}
              onChange={(e) => setTimeWindow(Number(e.target.value))}
              type="number"
              min={30}
              max={300}
              bg={inputBgColor}
              color={textColor}
            />
          </FormControl>
        </Flex>
        
        <Box>
          <Text fontSize="sm" color={textColor} mb={2} fontWeight="bold">Tipos monitorados:</Text>
          <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={2}>
            {types.map((type) => (
              <Checkbox
                key={type}
                isChecked={monitoredLists.includes(type)}
                onChange={(e) => handleCheckboxChange(type, e.target.checked)}
                colorScheme="blue"
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