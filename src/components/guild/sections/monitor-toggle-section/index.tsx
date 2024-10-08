import React, { useState, useEffect, useCallback } from 'react';
import { Switch, Flex, Text, useToast, Box, useColorModeValue, VStack, Button } from '@chakra-ui/react';
import { GuildMemberResponse } from '../../../../shared/interface/guild/guild-member.interface';
import { BombaMakerMonitor } from '../../guild-table/character-monitor';
import { AudioControl, useAudio } from '../../../../shared/hooks/useAudio';

interface MonitorToggleSectionProps {
  guildData: GuildMemberResponse[];
  isLoading: boolean;
  onStartMonitoring: () => void;
}

const MonitorToggleSection: React.FC<MonitorToggleSectionProps> = React.memo(({ guildData, isLoading, onStartMonitoring }) => {
  const [isClient, setIsClient] = useState(false);
  const [monitoringStarted, setMonitoringStarted] = useState(false);
  const [deathAudio, levelUpAudio] = useAudio([
    '/assets/notification_sound.mp3',
    '/assets/notification_sound2.wav'
  ]) as [AudioControl, AudioControl];

  const toast = useToast();

  const bgColor = useColorModeValue('black.900', 'black.900');
  const textColor = useColorModeValue('gray.100', 'gray.200');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleToggleDeathAudio = useCallback(() => {
    deathAudio.toggleAudio();
    toast({
      title: "Alerta sonoro de mortes alterado",
      description: "O estado do alerta sonoro de mortes foi alterado.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  }, [deathAudio, toast]);

  const handleToggleLevelUpAudio = useCallback(() => {
    levelUpAudio.toggleAudio();
    toast({
      title: "Alerta sonoro de level up alterado",
      description: "O estado do alerta sonoro de level up foi alterado.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  }, [levelUpAudio, toast]);

  const testDeathAudio = useCallback(() => {
    deathAudio.playAudio();
    const msg = "Teste de alerta de morte!";
    toast({
      title: "Teste de Alerta de Morte",
      description: msg,
      status: "warning",
      duration: 3000,
      isClosable: true,
    });
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(msg);
      utterance.lang = 'pt-BR';
      utterance.voice = speechSynthesis.getVoices().find(voice => voice.lang === 'pt-BR') || null;
      speechSynthesis.speak(utterance);
    }
  }, [deathAudio, toast]);

  const testLevelUpAudio = useCallback(() => {
    levelUpAudio.playAudio();
    const msg = "Teste de alerta de level up!";
    toast({
      title: "Teste de Alerta de Level Up",
      description: msg,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(msg);
      utterance.lang = 'pt-BR';
      utterance.voice = speechSynthesis.getVoices().find(voice => voice.lang === 'pt-BR') || null;
      speechSynthesis.speak(utterance);
    }
  }, [levelUpAudio, toast]);

  const handleStartMonitoring = useCallback(() => {
    if (!monitoringStarted) {
      setMonitoringStarted(true);
      deathAudio.markUserInteraction();
      levelUpAudio.markUserInteraction();
      onStartMonitoring();
      toast({
        title: "Monitoramento iniciado",
        description: "O monitoramento foi iniciado com sucesso.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [monitoringStarted, deathAudio, levelUpAudio, onStartMonitoring, toast]);

  if (!isClient) {
    return null;
  }

  return (
    <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="xl" width="100%">
      <VStack spacing={6} align="stretch" width="100%">
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontSize="md" fontWeight="semibold" color={textColor}>Alerta sonoro de mortes</Text>
          <Flex alignItems="center">
            <Switch
              isChecked={deathAudio.audioEnabled}
              onChange={handleToggleDeathAudio}
              colorScheme="red"
              size="lg"
              mr={4}
            />
            <Button onClick={testDeathAudio} colorScheme="red" size="sm">
              Testar
            </Button>
          </Flex>
        </Flex>
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontSize="md" fontWeight="semibold" color={textColor}>Alerta sonoro de level up</Text>
          <Flex alignItems="center">
            <Switch
              isChecked={levelUpAudio.audioEnabled}
              onChange={handleToggleLevelUpAudio}
              colorScheme="green"
              size="lg"
              mr={4}
            />
            <Button onClick={testLevelUpAudio} colorScheme="green" size="sm">
              Testar
            </Button>
          </Flex>
        </Flex>
        <Button 
          onClick={handleStartMonitoring} 
          colorScheme="blue" 
          size="lg" 
          isDisabled={monitoringStarted}
        >
          {monitoringStarted ? "Monitoramento Ativo" : "Iniciar Monitoramento"}
        </Button>
        <BombaMakerMonitor characters={guildData} isLoading={isLoading} />
      </VStack>
    </Box>
  );
});

MonitorToggleSection.displayName = 'MonitorToggleSection';
export default MonitorToggleSection;