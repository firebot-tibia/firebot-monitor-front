import React from 'react';
import { Box, Flex, Heading } from '@chakra-ui/react';
import { Death } from '../../../../shared/interface/death.interface';
import DeathTable from '../../../death-list';

interface DeathSectionProps {
  deathList: Death[];
  handleNewDeath: (newDeath: Death) => void;
  playAudio: () => void;
  audioEnabled: boolean;
}

export const DeathSection: React.FC<DeathSectionProps> = ({ deathList, handleNewDeath, playAudio, audioEnabled }) => {
  return (
    <Box>
      <Flex align="center" justify="center" mb={4}>
        <Heading as="h2" size="md">
          Mortes Recentes
        </Heading>
      </Flex>
      <DeathTable 
        deathList={deathList} 
        onNewDeath={handleNewDeath} 
        playAudio={playAudio}
        audioEnabled={audioEnabled}
      />
    </Box>
  );
};