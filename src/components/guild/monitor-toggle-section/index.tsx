import React, { useState, useEffect } from 'react';
import { Button, Collapse, Box } from '@chakra-ui/react';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { GuildMemberResponse } from '../../../shared/interface/guild-member.interface';
import { BombaMakerMonitor } from '../../guild-table/character-monitor';

interface MonitorToggleSectionProps {
  guildData: GuildMemberResponse[];
  isLoading: boolean;
}

const MonitorToggleSection: React.FC<MonitorToggleSectionProps> = React.memo(({ guildData, isLoading }) => {
  const [showMonitor, setShowMonitor] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setShowMonitor(!showMonitor)}
        rightIcon={showMonitor ? <ChevronUpIcon /> : <ChevronDownIcon />}
        size="sm"
        width="100%"
        variant="outline"
        bg="gray.700"
        _hover={{ bg: 'gray.600' }}
      >
        {showMonitor ? 'Esconder' : 'Mostrar'} Monitor de Masslog nas listas
      </Button>
      <Collapse in={showMonitor} animateOpacity>
        <Box p={2} color="white" bg="gray.700" rounded="md" shadow="md">
          <BombaMakerMonitor characters={guildData} isLoading={isLoading} />
        </Box>
      </Collapse>
    </>
  );
});

MonitorToggleSection.displayName = 'MonitorToggleSection';

export default MonitorToggleSection;