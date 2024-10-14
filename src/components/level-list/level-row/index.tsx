import React from "react";
import { Tr, Td } from "@chakra-ui/react";
import { Level } from "../../../shared/interface/level.interface";

interface LevelTableRowProps {
  level: Level;
}

export const LevelTableRow: React.FC<LevelTableRowProps> = ({ level }) => {
  return (
    <Tr>
      <Td>{level.player}</Td>
      <Td>{level.old_level}</Td>
      <Td>{level.new_level}</Td>
    </Tr>
  );
};