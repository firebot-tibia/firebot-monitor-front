import React from 'react';
import {
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Box,
  useColorModeValue
} from '@chakra-ui/react';
import { DeathData, PlayerDeaths } from '../../../../../shared/interface/guild-stats-player.interface';

interface DeathHistoryProps {
  deathData: PlayerDeaths | null;
}

const DeathHistory: React.FC<DeathHistoryProps> = ({ deathData }) => {
  const bgColor = useColorModeValue('gray.900', 'gray.900');
  const textColor = useColorModeValue('gray.100', 'gray.100');
  const statBgColor = useColorModeValue('gray.800', 'gray.800');
  const tableBgColor = useColorModeValue('gray.800', 'gray.800');
  const tableBorderColor = useColorModeValue('gray.700', 'gray.700');

  const renderDeathsTable = () => {
    if (!deathData || !Array.isArray(deathData.deaths) || deathData.deaths.length === 0) {
      return <Text color={textColor}>Nenhum dado de morte disponível.</Text>;
    }

    return (
      <Box overflowX="auto">
        <Table variant="simple" size="sm" bg={tableBgColor} borderColor={tableBorderColor}>
          <Thead>
            <Tr>
              <Th color={textColor}>Data</Th>
              <Th color={textColor}>Nível</Th>
              <Th color={textColor}>Morto por</Th>
              <Th color={textColor}>Descrição</Th>
            </Tr>
          </Thead>
          <Tbody>
            {deathData.deaths.map((death: DeathData, index: number) => (
              <Tr key={index}>
                <Td color={textColor}>{new Date(death.date).toLocaleDateString('pt-BR')}</Td>
                <Td color={textColor}>{death.text.match(/Level (\d+)/)?.[1] || 'N/A'}</Td>
                <Td color={textColor}>{death.killers.slice(0, 3).join(', ')}{death.killers.length > 3 ? ` e mais ${death.killers.length - 3}` : ''}</Td>
                <Td color={textColor}>{death.text}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    );
  };

  return (
    <VStack spacing={6} align="stretch" bg={bgColor} p={6} borderRadius="lg">
      <HStack justify="space-between" bg={statBgColor} p={4} borderRadius="md">
        <Stat>
          <StatLabel color={textColor}>Mortes (Último Dia)</StatLabel>
          <StatNumber color={textColor}>{deathData?.last_day || 0}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel color={textColor}>Mortes (Última Semana)</StatLabel>
          <StatNumber color={textColor}>{deathData?.last_week || 0}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel color={textColor}>Mortes (Último Mês)</StatLabel>
          <StatNumber color={textColor}>{deathData?.last_month || 0}</StatNumber>
        </Stat>
      </HStack>
      {renderDeathsTable()}
    </VStack>
  );
};

export default DeathHistory;