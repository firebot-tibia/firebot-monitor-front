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
  Flex,
  Badge,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import DashboardLayout from "../../components/dashboard";
import { Death } from "../../shared/interface/death.interface";
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

const ITEMS_PER_PAGE = 15;

const TruncatedText: React.FC<{ text: string }> = ({ text }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const truncatedText = text.length > 100 ? `${text.slice(0, 100)}...` : text;

  return (
    <>
      <Text isTruncated maxWidth="300px">
        {truncatedText}
        {text.length > 100 && (
          <Button size="xs" ml={2} onClick={onOpen}>
            <ChevronDownIcon />
          </Button>
        )}
      </Text>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Death Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>{text}</Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <Flex justify="center" align="center" mt={4}>
      <Button
        onClick={handlePrevious}
        isDisabled={currentPage === 1}
        mr={2}
        size="sm"
      >
        <ChevronLeftIcon />
      </Button>
      <Text fontSize="sm">
        Página {currentPage} de {totalPages}
      </Text>
      <Button
        onClick={handleNext}
        isDisabled={currentPage === totalPages}
        ml={2}
        size="sm"
      >
        <ChevronRightIcon />
      </Button>
    </Flex>
  );
};

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
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor de eventos.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [eventSourceError, toast]);

  const currentData = useMemo(() => {
    const lastIndex = currentPage * ITEMS_PER_PAGE;
    const firstIndex = lastIndex - ITEMS_PER_PAGE;
    return deathList.slice(firstIndex, lastIndex);
  }, [deathList, currentPage]);

  const totalPages = Math.max(1, Math.ceil(deathList.length / ITEMS_PER_PAGE));

  const handleClick = useCallback((death: Death) => {
    setSelectedDeath(death);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
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
      <Box overflowX="auto">
        <Table variant="simple" colorScheme="gray" size="sm">
          <Thead>
            <Tr>
              <Th>Nome</Th>
              <Th>Nível</Th>
              <Th>Vocação</Th>
              <Th>Cidade</Th>
              <Th>Morte</Th>
              <Th>Data</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentData.map((death) => (
              <Tr
                key={death.id}
                onClick={() => handleClick(death)}
                _hover={{ bg: 'gray.700', cursor: 'pointer' }}
              >
                <Td>
                  <Tooltip label={death.name} placement="top-start">
                    <Text isTruncated maxWidth="150px">{death.name}</Text>
                  </Tooltip>
                </Td>
                <Td><Badge colorScheme="purple">{death.level}</Badge></Td>
                <Td>
                  <Badge colorScheme="blue">
                    {death.vocation}
                  </Badge>
                </Td>
                <Td>
                  <Badge colorScheme="green">
                    {death.city}
                  </Badge>
                </Td>
                <Td><TruncatedText text={death.death} /></Td>
                <Td>{formatDate(death.date)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    );
  };

  if (!isClient) {
    return null;
  }

  return (
    <DashboardLayout>
      <Flex direction="column" align="center" justify="center" minHeight="calc(100vh - 100px)">
        <Box width="100%" maxWidth="1200px" p={4}>
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Text fontSize="2xl" fontWeight="bold">Mortes Recentes</Text>
              {!audioEnabled && (
                <Button onClick={enableAudio} colorScheme="blue" size="sm">
                  Habilitar Alerta Sonoro
                </Button>
              )}
            </Flex>
            <Box>
              {renderContent()}
              {deathList.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </Box>
            
            {selectedDeath && (
              <Box mt={4}>
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