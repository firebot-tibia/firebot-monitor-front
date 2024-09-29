import React from 'react';
import { Box, Heading } from '@chakra-ui/react';
import DashboardLayout from '../../components/layout';
import { ReservationsManager } from '../../components/reservations';

const Respawns: React.FC = () => {
  return (
    <DashboardLayout>
      <Box p={4}>
        <Heading as="h1" mb={6} textAlign="center">Respawns Planilhados</Heading>
        <ReservationsManager />
      </Box>
    </DashboardLayout>
  );
};

export default Respawns;