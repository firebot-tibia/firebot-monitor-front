'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  Spinner,
  HStack,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { fetchWorldsData } from '../../services/guilds';
import DashboardLayout from '../../components/dashboard';
import { WorldData } from '../../shared/interface/war.interface';
import WorldStatusTable from '../../components/war/world-table';


const WorldsWarStatus: React.FC = () => {
  const [worldsData, setWorldsData] = useState<WorldData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 20;

  useEffect(() => {
    const loadWorldsData = async () => {
      setLoading(true);
      try {
        const data = await fetchWorldsData();
        setWorldsData(data);
      } catch (error) {
        console.error('Failed to fetch worlds data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorldsData();
  }, []);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const paginatedWorlds = worldsData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <DashboardLayout>
      <Box>
        <Heading as="h1" mb={6} p={4} textAlign="center">Status de Guerra dos Mundos do Tibia</Heading>
        
        {loading ? (
          <Box textAlign="center" mt={4}>
            <Spinner size="xl" />
            <Text>Carregando...</Text>
          </Box>
        ) : (
          <>
            <WorldStatusTable worlds={paginatedWorlds} />

            <HStack mt={4} justify="space-between">
              <Button
                leftIcon={<ChevronLeftIcon />}
                onClick={() => handlePageChange(currentPage - 1)}
                isDisabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Text>
                Página {currentPage} de {Math.ceil(worldsData.length / itemsPerPage)}
              </Text>
              <Button
                rightIcon={<ChevronRightIcon />}
                onClick={() => handlePageChange(currentPage + 1)}
                isDisabled={currentPage === Math.ceil(worldsData.length / itemsPerPage)}
              >
                Próxima
              </Button>
            </HStack>
          </>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default WorldsWarStatus;