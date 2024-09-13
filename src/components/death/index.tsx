import React, { useState, useCallback, useMemo, useEffect } from "react";
import { 
  Box, 
  Button, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Text,
  VStack,
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
  Center,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { Death } from "../../shared/interface/death.interface";
import { useAudio } from "../../hooks/useAudio";
import { formatDate } from "../../shared/utils/date-utils";
import { DeathDetail } from './death-detail';
import { Pagination } from "../pagination";

const ITEMS_PER_PAGE = 50;

interface DeathTableProps {
  deathList: Death[];
  onNewDeath: (death: Death) => void;
}

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

export const DeathTable: React.FC<DeathTableProps> = ({ deathList, onNewDeath }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDeath, setSelectedDeath] = useState<Death | null>(null);
  const { audioEnabled, enableAudio, playAudio } = useAudio('/assets/notification_sound.mp3');
  const [newDeathCount, setNewDeathCount] = useState(0);

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

  useEffect(() => {
    if (deathList.length > 0) {
      const latestDeath = deathList[0];
      onNewDeath(latestDeath);
      setNewDeathCount((prevCount) => prevCount + 1);
      if (audioEnabled) {
        playAudio();
      }
    }
  }, [deathList, onNewDeath, audioEnabled, playAudio]);

  const renderContent = () => {
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

  return (
    <Flex direction="column" align="center" justify="center">
      <Box width="100%" maxWidth="1200px" p={4}>
        <VStack spacing={4} align="stretch">
          <Center>
            <Text fontSize="2xl" fontWeight="bold">
              Mortes Recentes
              {newDeathCount > 0 && (
                <Badge ml={2} colorScheme="red" borderRadius="full">
                  {newDeathCount}
                </Badge>
              )}
            </Text>
          </Center>
          <Flex justify="flex-end">
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
  );
};

export default DeathTable;