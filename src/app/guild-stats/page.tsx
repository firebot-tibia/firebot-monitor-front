'use client';
import React from 'react';
import { Box, Heading } from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard';
import GuildStatsContainer from '../../components/guild-stats/container';

const GuildStats: React.FC = () => {
  return (
    <DashboardLayout>
      <Box p={4}>
        <Heading as="h1" mb={6} textAlign="center">Estatísticas da Guilda</Heading>
        <GuildStatsContainer />
      </Box>
    </DashboardLayout>
  );
};

export default GuildStats;