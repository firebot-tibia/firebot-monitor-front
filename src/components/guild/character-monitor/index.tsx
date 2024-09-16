import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  useToast,
  Checkbox,
  CheckboxGroup,
  Heading,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Wrap,
  WrapItem,
  Badge,
  useColorModeValue
} from '@chakra-ui/react';
import { GuildMemberResponse } from '../../../shared/interface/guild-member.interface';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { useCharacterTypesView } from '../../../hooks/useTypeView';

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
  const types = useCharacterTypesView(characters);

  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

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
    <Box bg={bgColor} p={4} borderRadius="md" boxShadow="md">
      <audio ref={audioRef} src="/assets/notification_sound.mp3" />
      <VStack spacing={6} align="stretch">
        <Heading size="md" color={textColor}>Configurações de Monitoramento</Heading>
        <HStack spacing={8} alignItems="flex-start">
          <Box flex={1}>
            <Text fontSize="sm" fontWeight="bold" mb={2}>Número de personagens para alerta:</Text>
            <Slider
              value={threshold}
              onChange={(val) => setThreshold(val)}
              min={1}
              max={10}
              step={1}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb boxSize={6}>
                <Box color="tomato" as="span" fontSize="sm" fontWeight="bold">
                  {threshold}
                </Box>
              </SliderThumb>
            </Slider>
          </Box>
          <Box flex={1}>
            <Text fontSize="sm" fontWeight="bold" mb={2}>Janela de tempo (segundos):</Text>
            <Slider
              value={timeWindow}
              onChange={(val) => setTimeWindow(val)}
              min={30}
              max={300}
              step={30}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb boxSize={6}>
                <Box color="tomato" as="span" fontSize="sm" fontWeight="bold">
                  {timeWindow}
                </Box>
              </SliderThumb>
            </Slider>
          </Box>
        </HStack>
        <Box>
          <Text fontSize="sm" fontWeight="bold" mb={2}>Listas para monitorar:</Text>
          <CheckboxGroup colorScheme="green" value={monitoredLists} onChange={handleListChange}>
            <Wrap spacing={4}>
              {types.map((type) => (
                <WrapItem key={type}>
                  <Checkbox value={type}>
                    <Badge colorScheme="blue" fontSize="sm">
                      {type}
                    </Badge>
                  </Checkbox>
                </WrapItem>
              ))}
            </Wrap>
          </CheckboxGroup>
        </Box>
      </VStack>
    </Box>
  );
};