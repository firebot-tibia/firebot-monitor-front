import React from "react";
import {
  Box,
  VStack,
  Flex,
  Badge,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Divider,
  Center,
} from "@chakra-ui/react";
import { Level } from "../../../shared/interface/level.interface";
import { Pagination } from "../../pagination";
import { LevelTableRow } from "../level-row";
import { useLevelTable } from "../hooks/useLevel";

interface LevelTableProps {
  levelList: Level[];
  playAudio: () => void;
  audioEnabled: boolean;
}

const LevelTable: React.FC<LevelTableProps> = ({ levelList, playAudio, audioEnabled }) => {
  const {
    currentPage,
    newLevelUpCount,
    newLevelDownCount,
    levelUps,
    levelDowns,
    totalLevelUpPages,
    totalLevelDownPages,
    handlePageChange,
    getCurrentPageData,
  } = useLevelTable(levelList, playAudio, audioEnabled);

  const renderLevelTable = (levels: Level[], totalPages: number, title: string) => {
    const currentData = getCurrentPageData(levels);
    return (
      <Box>
        <Text fontSize="xl" fontWeight="bold" mb={2}>{title}</Text>
        <Box overflowX="auto">
          <Table variant="simple" colorScheme="gray" size="sm">
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>Nível Antigo</Th>
                <Th>Nível Novo</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentData.map((level, index) => (
                <LevelTableRow key={`${level.player}-${level.new_level}-${index}`} level={level} />
              ))}
            </Tbody>
          </Table>
        </Box>
        {levels.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </Box>
    );
  };

  const EmptyState = () => (
    <Center h="200px">
      <VStack spacing={4}>
        <Text fontSize="xl" fontWeight="medium">
          Sem alterações de nível recentes
        </Text>
        <Text color="gray.500">
          As alterações de nível aparecerão aqui quando ocorrerem.
        </Text>
      </VStack>
    </Center>
  );

  return (
    <Box width="100%" maxWidth="1200px" p={4} mx="auto">
      <VStack spacing={4} align="stretch">
        <Flex justify="center" align="center">
          <Text fontSize="2xl" fontWeight="bold">
            {newLevelUpCount > 0 && (
              <Badge ml={2} colorScheme="green" borderRadius="full">
                +{newLevelUpCount}
              </Badge>
            )}
            {newLevelDownCount > 0 && (
              <Badge ml={2} colorScheme="red" borderRadius="full">
                -{newLevelDownCount}
              </Badge>
            )}
          </Text>
        </Flex>
        {levelUps.length === 0 && levelDowns.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {levelUps.length > 0 && renderLevelTable(levelUps, totalLevelUpPages, "Level Up")}
            {levelUps.length > 0 && levelDowns.length > 0 && <Divider my={4} />}
            {levelDowns.length > 0 && renderLevelTable(levelDowns, totalLevelDownPages, "Level Down")}
          </>
        )}
      </VStack>
    </Box>
  );
};

export default LevelTable;