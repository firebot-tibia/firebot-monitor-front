import React from 'react';
import {
  Box,
  VStack,
  Checkbox,
  Heading,
  Input,
  SimpleGrid,
  useColorModeValue,
  Flex,
  FormControl,
  FormLabel,
  Text
} from '@chakra-ui/react';
import { GuildMemberResponse } from '../../../../shared/interface/guild/guild-member.interface';
import { useCharacterTypesView } from '../../../../shared/hooks/useTypeView';
import { useCharacterMonitoring } from '../hooks/useMonitor';

interface BombaMakerMonitorProps {
  characters: GuildMemberResponse[];
  isLoading: boolean;
}

export const BombaMakerMonitor: React.FC<BombaMakerMonitorProps> = ({ characters }) => {
  const types = useCharacterTypesView(characters);
  const {
    threshold,
    setThreshold,
    timeWindow,
    setTimeWindow,
    monitoredLists,
    handleCheckboxChange
  } = useCharacterMonitoring(characters, types);

  const textColor = useColorModeValue('gray.100', 'gray.200');
  const inputBgColor = useColorModeValue('black.700', 'black.800');

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="md" color={textColor}>Configurações de Monitoramento</Heading>
      
      <Flex direction={{ base: "column", md: "row" }} gap={4}>
        <FormControl>
          <FormLabel htmlFor="threshold" color={textColor}>Número Total de Personagens</FormLabel>
          <Input
            id="threshold"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            type="number"
            min={1}
            max={50}
            bg={inputBgColor}
            color={textColor}
          />
        </FormControl>
        
        <FormControl>
          <FormLabel htmlFor="timeWindow" color={textColor}>Tempo (segundos)</FormLabel>
          <Input
            id="timeWindow"
            value={timeWindow}
            onChange={(e) => setTimeWindow(Number(e.target.value))}
            type="number"
            min={30}
            max={300}
            bg={inputBgColor}
            color={textColor}
          />
        </FormControl>
      </Flex>
      
      <Box>
        <Text fontSize="sm" color={textColor} mb={2} fontWeight="bold">Tipos monitorados:</Text>
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={2}>
          {types.map((type) => (
            <Checkbox
              key={type}
              isChecked={monitoredLists.includes(type)}
              onChange={(e) => handleCheckboxChange(type, e.target.checked)}
              colorScheme="blue"
            >
              <Text fontSize="sm" color={textColor}>{type}</Text>
            </Checkbox>
          ))}
        </SimpleGrid>
      </Box>
    </VStack>
  );
};
