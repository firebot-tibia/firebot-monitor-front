import React from 'react';
import { Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Box, Badge } from '@chakra-ui/react';
import { Death } from '../../../../shared/interface/death.interface';
import DeathTable from '../../../death-list';

interface DeathSectionProps {
  deathList: Death[];
  newDeathCount: number;
  handleNewDeath: (newDeath: Death) => void;
}

const DeathSection: React.FC<DeathSectionProps> = React.memo(({ deathList, newDeathCount, handleNewDeath }) => (
  <Accordion allowToggle>
    <AccordionItem>
      <h2>
        <AccordionButton>
          <Box flex="1" textAlign="center">
            Mortes Recentes
          </Box>
          <AccordionIcon />
          {newDeathCount > 0 && (
            <Badge ml={2} colorScheme="red" borderRadius="full">
              {newDeathCount}
            </Badge>
          )}
        </AccordionButton>
      </h2>
      <AccordionPanel pb={4}>
        <DeathTable deathList={deathList} onNewDeath={handleNewDeath} />
      </AccordionPanel>
    </AccordionItem>
  </Accordion>
));

DeathSection.displayName = 'DeathSection';

export default DeathSection;