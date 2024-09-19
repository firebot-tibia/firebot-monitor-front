import React from "react";
import { 
  Tr, 
  Td, 
  Text,
  Badge,
  Tooltip,
} from "@chakra-ui/react";
import { Death } from "../../../shared/interface/death.interface";
import { formatDate } from "../../../shared/utils/date-utils";
import { TruncatedText } from "../truncated-text";

interface DeathTableRowProps {
  death: Death;
  onClick: () => void;
}

export const DeathTableRow: React.FC<DeathTableRowProps> = ({ death, onClick }) => {
  return (
    <Tr
      onClick={onClick}
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
  );
};