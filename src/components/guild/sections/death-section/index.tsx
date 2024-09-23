import React from 'react';
import { Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Box, Badge, Flex, Heading } from '@chakra-ui/react';
import { Death } from '../../../../shared/interface/death.interface';
import DeathTable from '../../../death-list';

interface DeathSectionProps {
  deathList: Death[];
  newDeathCount: number;
  handleNewDeath: (newDeath: Death) => void;
}

const DeathSection: React.FC<DeathSectionProps> = ({ deathList, newDeathCount, handleNewDeath }) => {
  return (
    <Box>
      <Flex align="center" justify="center" mb={4}>
        <Heading as="h2" size="md">
          Mortes Recentes
        </Heading>
        {newDeathCount > 0 && (
          <Badge ml={2} colorScheme="red" borderRadius="full">
            {newDeathCount}
          </Badge>
        )}
      </Flex>
      <DeathTable deathList={deathList} onNewDeath={handleNewDeath} />
    </Box>
  );
};

export default DeathSection;