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
import { useCharacterTypesView } from '../../../../hooks/characters/types/useTypeView';
import { useLocalStorage } from '../../../../hooks/global/useLocalStorage';
import { GuildMemberResponse } from '../../../../shared/interface/guild-member.interface';


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

  const bgColor = useColorModeValue('gray.800', 'gray.900');
  const textColor = useColorModeValue('gray.100', 'gray.200');
  const accentColor = useColorModeValue('blue.400', 'blue.300');
  
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

  return (
    <Box bg={bgColor} p={4} borderRadius="md" boxShadow="md">
      <VStack spacing={4} align="stretch">
        <Heading size="sm" color={textColor}>Configurações de Monitoramento</Heading>
        
        <HStack spacing={4} align="center">
          <Text fontSize="xs" color={textColor} width="60px">Personagens:</Text>
          <Slider
            value={threshold}
            onChange={(val) => setThreshold(val)}
            min={1}
            max={10}
            step={1}
            flex={1}
          >
            <SliderTrack bg="gray.600">
              <SliderFilledTrack bg={accentColor} />
            </SliderTrack>
            <SliderThumb boxSize={4} bg={accentColor}>
              <Text fontSize="xs" fontWeight="bold" color="gray.800">{threshold}</Text>
            </SliderThumb>
          </Slider>
        </HStack>
        
        <HStack spacing={4} align="center">
          <Text fontSize="xs" color={textColor} width="60px">Tempo (s):</Text>
          <Slider
            value={timeWindow}
            onChange={(val) => setTimeWindow(val)}
            min={30}
            max={300}
            step={30}
            flex={1}
          >
            <SliderTrack bg="gray.600">
              <SliderFilledTrack bg={accentColor} />
            </SliderTrack>
            <SliderThumb boxSize={4} bg={accentColor}>
              <Text fontSize="xs" fontWeight="bold" color="gray.800">{timeWindow}</Text>
            </SliderThumb>
          </Slider>
        </HStack>
        
        <Wrap spacing={2}>
          {types.map((type) => (
            <WrapItem key={type}>
              <Checkbox
                size="sm"
                colorScheme="blue"
                isChecked={monitoredLists.includes(type)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setMonitoredLists([...monitoredLists, type]);
                  } else {
                    setMonitoredLists(monitoredLists.filter(t => t !== type));
                  }
                }}
              >
                <Text fontSize="xs" color={textColor}>{type}</Text>
              </Checkbox>
            </WrapItem>
          ))}
        </Wrap>
      </VStack>
    </Box>
  );
};