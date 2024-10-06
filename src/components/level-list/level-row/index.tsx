import React from "react";
import { Tr, Td } from "@chakra-ui/react";
import { Level } from "../../../shared/interface/level.interface";

interface LevelTableRowProps {
  level: Level;
}

export const LevelTableRow: React.FC<LevelTableRowProps> = ({ level }) => {
  return (
    <Tr>
      <Td>{level.character}</Td>
      <Td>{level.oldLevel}</Td>
      <Td>{level.newLevel}</Td>
      <Td>{level.date.toLocaleString()}</Td>
    </Tr>
  );
};