'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Spinner,
} from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { fetchWorldDetails } from '../../../../services/guilds';
import DashboardLayout from '../../../../components/dashboard';
import { WorldData } from '../../../../shared/interface/war.interface';

const WorldDetails: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const world = params.world as string || searchParams.get('world');
  const [loading, setLoading] = useState(true);
  const [worldData, setWorldData] = useState<WorldData | null>(null);

  useEffect(() => {
    const loadWorldData = async () => {
      if (world) {
        setLoading(true);
        try {
          const data = await fetchWorldDetails(world);
          setWorldData(data);
        } catch (error) {
          console.error('Failed to fetch world details:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadWorldData();
  }, [world]);

  const handleBack = () => {
    router.push('/war');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box textAlign="center" p={8} mt={4}>
          <Spinner size="xl" />
          <Text>Carregando detalhes do mundo...</Text>
        </Box>
      </DashboardLayout>
    );
  }

  if (!worldData) {
    return (
      <DashboardLayout>
        <Box textAlign="center" p={8} mt={4}>
          <Text>Dados do mundo não encontrados.</Text>
          <Button onClick={handleBack} mt={4}>Voltar para a lista de mundos</Button>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box p={8} mt={4}>
        <Button leftIcon={<ChevronLeftIcon />} onClick={handleBack} mb={4}>
          Voltar para lista de mundos
        </Button>
      </Box>
        <Box textAlign="center" p={8} mt={4}>
        <Heading as="h1" mb={6}>Detalhes do Mundo: {worldData.world}</Heading>
        <VStack align="start" spacing={4}>
          <HStack>
            <Text fontWeight="bold">Status:</Text>
            <Text>{worldData.status}</Text>
          </HStack>
          <HStack>
            <Text fontWeight="bold">Guild Dominante:</Text>
            <Text>{worldData.dominantGuild}</Text>
          </HStack>
          <HStack>
            <Text fontWeight="bold">Guild Inimiga:</Text>
            <Text>{worldData.enemyGuild || '-'}</Text>
          </HStack>
          <HStack>
            <Text fontWeight="bold">Players Dominante:</Text>
            <Text>{`${worldData.playersOnline}/${worldData.totalPlayersDominated}`}</Text>
          </HStack>
          <HStack>
            <Text fontWeight="bold">Players Inimiga:</Text>
            <Text>{`${worldData.playersOnline}/${worldData.totalPlayersEnemy}`}</Text>
          </HStack>
          <HStack>
            <Text fontWeight="bold">Aliança:</Text>
            <Text>{worldData.alliance}</Text>
          </HStack>
        </VStack>
      </Box>
    </DashboardLayout>
  );
};

export default WorldDetails;