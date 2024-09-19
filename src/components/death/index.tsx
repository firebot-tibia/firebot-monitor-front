import React, { useState, useCallback, useEffect, useRef } from "react";
import { 
  Box, 
  VStack,
  Flex,
  Badge,
  Text,
  Button,
  Center,
} from "@chakra-ui/react";
import { Death } from "../../shared/interface/death.interface";
import { useAudio } from "../../hooks/useAudio";
import { Pagination } from "../pagination";
import { DeathDetail } from "./death-detail";
import { DeathTableContent } from "./death-table";


const ITEMS_PER_PAGE = 50;

interface DeathTableProps {
  deathList: Death[];
}

export const DeathTable: React.FC<DeathTableProps> = ({ deathList }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDeath, setSelectedDeath] = useState<Death | null>(null);
  const [newDeathCount, setNewDeathCount] = useState(0);
  const { audioEnabled, enableAudio, playAudio, initializeAudio } = useAudio('/assets/notification_sound.mp3');
  const previousDeathListLength = useRef(deathList.length);

  const totalPages = Math.max(1, Math.ceil(deathList.length / ITEMS_PER_PAGE));

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  useEffect(() => {
    if (deathList.length > previousDeathListLength.current) {
      const newDeathsCount = deathList.length - previousDeathListLength.current;
      setNewDeathCount((prevCount) => prevCount + newDeathsCount);
      if (audioEnabled) {
        playAudio();
      }
    }
    previousDeathListLength.current = deathList.length;
  }, [deathList, audioEnabled, playAudio]);

  const handleEnableAudio = useCallback(() => {
    enableAudio();
    initializeAudio();
  }, [enableAudio, initializeAudio]);

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
              <Button 
                onClick={handleEnableAudio} 
                colorScheme="blue" 
                size="sm"
              >
                Habilitar Alerta Sonoro
              </Button>
            )}
          </Flex>
          <DeathTableContent 
            deathList={deathList} 
            currentPage={currentPage} 
            itemsPerPage={ITEMS_PER_PAGE}
            onDeathClick={setSelectedDeath}
          />
          {deathList.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
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