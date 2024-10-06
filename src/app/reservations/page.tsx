import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import DashboardLayout from '../../components/layout';
import { ReservationsManager } from '../../components/reservations';
import { addDays, differenceInDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Respawns: React.FC = () => {
  const now = new Date();
  const currentMonth = format(now, 'MMMM', { locale: ptBR });
  const nextRotation = addDays(now, 30);
  const daysUntilRotation = differenceInDays(nextRotation, now);

  return (
    <DashboardLayout>
      <Box p={4}>
        <Heading as="h1" mb={6} textAlign="center">Respawns Planilhados - {currentMonth}</Heading>
        <Text textAlign="center">
            Próxima rotação em {daysUntilRotation} dias ({format(nextRotation, 'dd/MM/yyyy')})
        </Text>
        <ReservationsManager />
      </Box>
    </DashboardLayout>
  );
};

export default Respawns;