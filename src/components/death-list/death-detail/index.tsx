import { Box, Text } from '@chakra-ui/react';
import { Death } from '../../../shared/interface/death.interface';
import { formatDate } from '../../../shared/utils/utils';

interface DeathDetailProps {
  death: Death;
}

export const DeathDetail: React.FC<DeathDetailProps> = ({ death }) => (
  <Box mt={6} p={4} borderWidth="1px" borderRadius="lg" overflow="hidden" bg="gray.700">
    <Text fontSize="xl" fontWeight="bold">Detalhes da Morte</Text>
    <Text><strong>Nome:</strong> {death.name}</Text>
    <Text><strong>Level:</strong> {death.level}</Text>
    <Text><strong>Vocação:</strong> {death.vocation}</Text>
    <Text><strong>Cidade:</strong> {death.city}</Text>
    <Text><strong>Morte:</strong> {death.death}</Text>
    <Text><strong>Data:</strong> {formatDate(death.date)}</Text>
  </Box>
);
