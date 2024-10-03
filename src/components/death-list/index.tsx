import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Box,
  VStack,
  Flex,
  Badge,
  Text,
  Center,
  useToast,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";
import { Death } from "../../shared/interface/death.interface";
import { Pagination } from "../pagination";
import { DeathDetail } from "./death-detail";
import { DeathTableContent } from "./death-table";

interface DeathTableProps {
  deathList: Death[];
  onNewDeath?: (newDeath: Death) => void;
  playAudio: () => void;
  audioEnabled: boolean;
}

const ITEMS_PER_PAGE = 50;

export const DeathTable: React.FC<DeathTableProps> = ({ deathList, onNewDeath, playAudio, audioEnabled }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDeath, setSelectedDeath] = useState<Death | null>(null);
  const [newDeathCount, setNewDeathCount] = useState(0);
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
  }, [deathList, onNewDeath, audioEnabled, playAudio]);

  const handleCopyAllDeaths = useCallback(() => {
    const textToCopy = deathList.map(death => `${death.name}: ${death.death}`).join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: "Todas as mortes copiadas",
        description: "Todas as mortes foram copiadas para a área de transferência.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    });
  }, [deathList, toast]);

  return (
    <Flex direction="column" align="center" justify="center">
      <Box width="100%" maxWidth="1200px" p={4}>
        <VStack spacing={4} align="stretch">
          <Flex justify="space-between" align="center">
            <Center>
              <Text fontSize="2xl" fontWeight="bold">
                {newDeathCount > 0 && (
                  <Badge ml={2} colorScheme="red" borderRadius="full">
                    {newDeathCount}
                  </Badge>
                )}
              </Text>
            </Center>
            <Flex>
              <Tooltip label="Copiar todas as mortes">
                <IconButton
                  aria-label="Copiar todas as mortes"
                  icon={<CopyIcon />}
                  onClick={handleCopyAllDeaths}
                  mr={2}
                />
              </Tooltip>
            </Flex>
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