import React from "react";
import { 
  Tr, 
  Td, 
  Text,
  Badge,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { Death } from "../../../shared/interface/death.interface";
import { TruncatedText } from "../truncated-text";
import { formatDate } from "../../../shared/utils/utils";

interface DeathTableRowProps {
  death: Death;
}

export const DeathTableRow: React.FC<DeathTableRowProps> = ({ death }) => {
  const toast = useToast();

  const handleClick = () => {
    const textToCopy = `${death.name}: ${death.text}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: "Copiado para a área de transferência",
        description: "Nome do personagem e descrição da morte foram copiados.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    });
  };

  return (
    <Tr
      onClick={handleClick}
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
      <Td><TruncatedText text={death.text} /></Td>
      <Td>{formatDate(death.date)}</Td>
    </Tr>
  );
};