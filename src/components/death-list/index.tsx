import React from "react";
import {
  Box,
  VStack,
  Flex,
  Badge,
  Text,
  Center,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";
import { Death } from "../../shared/interface/death.interface";
import { Pagination } from "../pagination";
import { DeathTableContent } from "./death-table";
import { useDeathTable } from "./hooks/useDeath";

const ITEMS_PER_PAGE = 50;
interface DeathTableProps {
  deathList: Death[];
  playAudio: () => void;
  audioEnabled: boolean;
}

export const DeathTable: React.FC<DeathTableProps> = ({
  deathList,
  playAudio,
  audioEnabled
}) => {
  const {
    currentPage,
    totalPages,
    newDeathCount,
    handlePageChange,
    handleCopyAllDeaths,
  } = useDeathTable(deathList, playAudio, audioEnabled);

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
          />

          {deathList.length > 0 && (
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

export default DeathTable;