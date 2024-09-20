import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Box,
  VStack,
  Flex,
  Badge,
  Text,
  Button,
  Center,
  useToast,
} from "@chakra-ui/react";
import { Death } from "../../shared/interface/death.interface";
import { useAudio } from "../../hooks/global/useAudio";
import { Pagination } from "../pagination";
import { DeathDetail } from "./death-detail";
import { DeathTableContent } from "./death-table";

const ITEMS_PER_PAGE = 50;

interface DeathTableProps {
  deathList: Death[];
  onNewDeath?: (newDeath: Death) => void;
}

export const DeathTable: React.FC<DeathTableProps> = ({ deathList, onNewDeath }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDeath, setSelectedDeath] = useState<Death | null>(null);
  const [newDeathCount, setNewDeathCount] = useState(0);
  const { audioEnabled, enableAudio, playAudio, initializeAudio } = useAudio('/assets/notification_sound.mp3');
  const previousDeathListLength = useRef(deathList.length);
  const totalPages = Math.max(1, Math.ceil(deathList.length / ITEMS_PER_PAGE));
  const toast = useToast();

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
      for (let i = previousDeathListLength.current; i < deathList.length; i++) {
        onNewDeath && onNewDeath(deathList[i]);
      }
    }
    previousDeathListLength.current = deathList.length;
  }, [deathList, audioEnabled, playAudio, onNewDeath]);

  const handleEnableAudio = useCallback(() => {
    enableAudio();
    initializeAudio();
    toast({
      title: "Alerta sonoro habilitado",
      description: "Você receberá notificações sonoras para novas mortes.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  }, [enableAudio, initializeAudio, toast]);

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