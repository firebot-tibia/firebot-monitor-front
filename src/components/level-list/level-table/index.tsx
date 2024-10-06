import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Box,
  VStack,
  Flex,
  Badge,
  Text,
  Center,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
} from "@chakra-ui/react";
import { Level } from "../../../shared/interface/level.interface";
import { Pagination } from "../../pagination";
import { LevelTableRow } from "../level-row";

interface LevelTableProps {
  levelList: Level[];
  playAudio: () => void;
  audioEnabled: boolean;
  isLevelUp: boolean;
}

const ITEMS_PER_PAGE = 50;

const LevelTable: React.FC<LevelTableProps> = ({ levelList, playAudio, audioEnabled, isLevelUp }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [newLevelCount, setNewLevelCount] = useState(0);
  const previousLevelListLength = useRef(levelList.length);
  const totalPages = Math.max(1, Math.ceil(levelList.length / ITEMS_PER_PAGE));
  const toast = useToast();

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  useEffect(() => {
    if (levelList.length > previousLevelListLength.current) {
      const newLevelsCount = levelList.length - previousLevelListLength.current;
      setNewLevelCount((prevCount) => prevCount + newLevelsCount);
      if (audioEnabled) {
        playAudio();
      }
    }
    previousLevelListLength.current = levelList.length;
  }, [levelList, audioEnabled, playAudio]);

  const handleCopyAllLevels = useCallback(() => {
    const textToCopy = levelList.map(level => `${level.character}: ${level.oldLevel} -> ${level.newLevel}`).join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: `Todas as alterações de nível copiadas`,
        description: `Todas as alterações de nível foram copiadas para a área de transferência.`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    });
  }, [levelList, toast]);

  const currentData = levelList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const EmptyState = () => (
    <Box textAlign="center" py={10}>
      <Text fontSize="xl" fontWeight="medium" mb={4}>
        Sem alterações de nível recentes
      </Text>
      <Text color="gray.500">
        As alterações de nível aparecerão aqui quando ocorrerem.
      </Text>
    </Box>
  );

  return (
    <Flex direction="column" align="center" justify="center">
      <Box width="100%" maxWidth="1200px" p={4}>
        <VStack spacing={4} align="stretch">
          <Flex justify="space-between" align="center">
            <Center>
              <Text fontSize="2xl" fontWeight="bold">
                {newLevelCount > 0 && (
                  <Badge ml={2} colorScheme={isLevelUp ? "green" : "red"} borderRadius="full">
                    {newLevelCount}
                  </Badge>
                )}
              </Text>
            </Center>
            <Flex>
            </Flex>
          </Flex>
          {levelList.length === 0 ? (
            <EmptyState />
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" colorScheme="gray" size="sm">
                <Thead>
                  <Tr>
                    <Th>Nome</Th>
                    <Th>Nível Antigo</Th>
                    <Th>Nível Novo</Th>
                    <Th>Data</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {currentData.map((level) => (
                    <LevelTableRow key={`${level.character}-${level.date.getTime()}`} level={level} />
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
          {levelList.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </VStack>
      </Box>
    </Flex>
  );
};

export default LevelTable;