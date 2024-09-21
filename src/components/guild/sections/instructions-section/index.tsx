import React from 'react';
import { Flex } from '@chakra-ui/react';
import InstructionsBox from '../../guild-table/instructions-box';


const InstructionsSection: React.FC = React.memo(() => (
  <Flex justify="space-between" bg="blue.900" p={2} mt={4} rounded="md">
    <InstructionsBox />
  </Flex>
));

InstructionsSection.displayName = 'InstructionsSection';

export default InstructionsSection;