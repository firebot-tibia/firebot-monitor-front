import React, { useMemo } from "react";
import { 
  Box, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Text,
} from "@chakra-ui/react";
import { Death } from "../../../shared/interface/death.interface";
import { DeathTableRow } from "../death-row";

interface DeathTableContentProps {
  deathList: Death[];
  currentPage: number;
  itemsPerPage: number;
  onDeathClick: (death: Death) => void;
}

export const DeathTableContent: React.FC<DeathTableContentProps> = ({ 
  deathList, 
  currentPage, 
  itemsPerPage, 
  onDeathClick 
}) => {
  const currentData = useMemo(() => {
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    return deathList.slice(firstIndex, lastIndex);
  }, [deathList, currentPage, itemsPerPage]);

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
            <DeathTableRow key={death.id} death={death} onClick={() => onDeathClick(death)} />
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};