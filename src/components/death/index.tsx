'use client';

import React, { useState, useCallback, useMemo, useEffect, ComponentType } from "react";
import dynamic from 'next/dynamic';
import { 
  Box, 
  Button, 
  Spinner, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Text,
  useToast,
  VStack,
  Center,
  Flex
} from "@chakra-ui/react";
import DashboardLayout from "../../components/dashboard";
import { Death } from "../../shared/interface/death.interface";
import { Pagination } from "../../components/pagination";
import { useAudio } from "../../hooks/useAudio";
import { useDeaths } from "../../hooks/useDeaths";
import { formatDate } from "../../shared/utils/date-utils";
import { useEventSource } from "../../hooks/useEvent";

interface DeathDetailProps {
  death: Death;
}

const DeathDetail = dynamic<DeathDetailProps>(
  () => import('./death-detail').then((mod) => mod.DeathDetail as ComponentType<DeathDetailProps>),
  { ssr: false }
);

const ITEMS_PER_PAGE = 10;

export const DeathTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDeath, setSelectedDeath] = useState<Death | null>(null);
  const toast = useToast();
  const { deathList, addDeath } = useDeaths();
  const { audioEnabled, enableAudio, playAudio } = useAudio('/assets/notification_sound.mp3');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleNewDeath = useCallback((newDeath: Death) => {
    addDeath(newDeath);
    setIsInitialLoad(false);
    if (audioEnabled) {
      playAudio();
    }
    if (!selectedDeath) {
      setSelectedDeath(newDeath);
    }
  }, [addDeath, audioEnabled, playAudio, selectedDeath]);

  const handleMessage = useCallback((data: any) => {
    if (data?.death) {
      const newDeath: Death = {
        ...data.death,
        id: `${data.death.name}-${Date.now()}`,
        date: new Date(data.death.date || Date.now()),
        death: data.death.text,
      };
      handleNewDeath(newDeath);
    }
    setIsInitialLoad(false);
  }, [handleNewDeath]);

  const { error: eventSourceError } = useEventSource(
    isClient ? `https://api.firebot.run/subscription/enemy/` : null,
    handleMessage
  );

  useEffect(() => {
    if (eventSourceError) {
      setIsInitialLoad(false);
    }
  }, [eventSourceError, toast]);

  const currentData = useMemo(() => {
    const lastIndex = currentPage * ITEMS_PER_PAGE;
    const firstIndex = lastIndex - ITEMS_PER_PAGE;
    return deathList.slice(firstIndex, lastIndex);
  }, [deathList, currentPage]);

  const totalPages = Math.ceil(deathList.length / ITEMS_PER_PAGE);

  const handleClick = useCallback((death: Death) => {
    setSelectedDeath(death);
  }, []);

  const renderContent = () => {
    if (!isClient) {
      return null;
    }

    if (isInitialLoad) {
      return (
        <Center height="200px">
          <Spinner size="xl" />
        </Center>
      );
    }

    if (deathList.length === 0) {
      return <Text textAlign="center" fontSize="lg">Sem mortes recentes</Text>;
    }

    if (currentData.length === 0) {
      return <Text textAlign="center" fontSize="lg">Nenhuma morte nesta página</Text>;
    }

    return (
      <Table variant="simple" colorScheme="gray">
        <Thead>
          <Tr>
            <Th>Nome</Th>
            <Th>Nível</Th>
            <Th>Vocação</Th>
            <Th>Cidade</Th>
            <Th>Morte</Th>
            <Th>Data</Th>
            <Th>Tipo</Th>
          </Tr>
        </Thead>
        <Tbody>
          {currentData.map((death) => (
            <Tr
              key={death.id}
              onClick={() => handleClick(death)}
              _hover={{ bg: 'gray.600', cursor: 'pointer' }}
            >
              <Td>{death.name}</Td>
              <Td>{death.level}</Td>
              <Td>{death.vocation}</Td>
              <Td>{death.city}</Td>
              <Td>{death.death}</Td>
              <Td>{formatDate(death.date)}</Td>
              <Td>{death.kind}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    );
  };

  if (!isClient) {
    return null;
  }

  return (
    <DashboardLayout>
      <Flex direction="column" align="center" justify="center" minHeight="calc(100vh - 100px)">
        <Box width="100%" maxWidth="1200px" p={12}>
          <VStack spacing={8} align="center">
            <Text fontSize="3xl" fontWeight="bold" textAlign="center">Mortes Recentes</Text>
            {!audioEnabled && (
              <Button onClick={enableAudio} colorScheme="blue">
                Habilitar Alerta Sonoro
              </Button>
            )}
            <Box width="100%">
              {renderContent()}
              {deathList.length > 0 && (
                <Box mt={4}>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </Box>
              )}
            </Box>
            
            {selectedDeath && (
              <Box mt={4} width="100%">
                <DeathDetail death={selectedDeath} />
              </Box>
            )}
          </VStack>
        </Box>
      </Flex>
    </DashboardLayout>
  );
};

export default DeathTable;