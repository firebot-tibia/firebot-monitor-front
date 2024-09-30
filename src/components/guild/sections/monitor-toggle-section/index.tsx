import React, { useState, useEffect } from 'react';
import { Button, Collapse, Box, Switch, Flex, Text, useToast } from '@chakra-ui/react';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { GuildMemberResponse } from '../../../../shared/interface/guild-member.interface';
import { BombaMakerMonitor } from '../../guild-table/character-monitor';
import { useAudio } from '../../../../hooks/global/useAudio';

interface MonitorToggleSectionProps {
  guildData: GuildMemberResponse[];
  isLoading: boolean;
}

const MonitorToggleSection: React.FC<MonitorToggleSectionProps> = React.memo(({ guildData, isLoading }) => {
  const [showMonitor, setShowMonitor] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { audioEnabled, toggleAudio, initializeAudio } = useAudio('/assets/notification_sound.mp3');
  const toast = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleToggleAudio = () => {
    toggleAudio();
    initializeAudio();
    toast({
      title: audioEnabled ? "Alerta sonoro desabilitado" : "Alerta sonoro habilitado",
      description: audioEnabled
        ? "Você não receberá mais notificações sonoras para novas mortes."
        : "Você receberá notificações sonoras para novas mortes.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  if (!isClient) {
    return null;
  }

  return (
    <Box p={4} borderRadius="xl" boxShadow="xl">
      <Button
        onClick={() => setShowMonitor(!showMonitor)}
        rightIcon={showMonitor ? <ChevronUpIcon /> : <ChevronDownIcon />}
        size="md"
        width="100%"
        variant="outline"
        bg="gray.800"
        color="white"
        _hover={{ bg: 'gray.700' }}
        mb={4}
      >
        {showMonitor ? 'Esconder' : 'Mostrar'} Gerenciamento de alertas
      </Button>
      <Collapse in={showMonitor} animateOpacity>
        <Box p={4} color="white" bg="gray.800" rounded="md" shadow="md" mt={2}>
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="md" fontWeight="semibold">Alerta sonoro de mortes</Text>
            <Switch
              isChecked={audioEnabled}
              onChange={handleToggleAudio}
              colorScheme="blue"
              size="lg"
            />
          </Flex>
          <BombaMakerMonitor characters={guildData} isLoading={isLoading} />
        </Box>
      </Collapse>
    </Box>
  );
});

MonitorToggleSection.displayName = 'MonitorToggleSection';
export default MonitorToggleSection;