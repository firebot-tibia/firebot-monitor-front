import React, { useState, useEffect, useCallback } from 'react';
import { Button, Collapse, Box, Switch, Flex, Text, useToast } from '@chakra-ui/react';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { GuildMemberResponse } from '../../../../shared/interface/guild/guild-member.interface';
import { BombaMakerMonitor } from '../../guild-table/character-monitor';
import { useAudio } from '../../../../shared/hooks/useAudio';

interface MonitorToggleSectionProps {
  guildData: GuildMemberResponse[];
  isLoading: boolean;
}

const MonitorToggleSection: React.FC<MonitorToggleSectionProps> = React.memo(({ guildData, isLoading }) => {
  const [showMonitor, setShowMonitor] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { audioEnabled, toggleAudio } = useAudio('/assets/notification_sound.mp3');
  const toast = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleToggleAudio = useCallback(() => {
    toggleAudio();
    toast({
      title: "Alerta sonoro alterado",
      description: "O estado do alerta sonoro foi alterado.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  }, [toggleAudio, toast]);

  if (!isClient) {
    return null;
  }

  return (
    <Box p={4} borderRadius="xl" boxShadow="xl">
      <Button
        onClick={() => setShowMonitor(prev => !prev)}
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