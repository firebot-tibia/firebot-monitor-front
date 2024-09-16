import React, { FC } from 'react';
import { 
  Table, Thead, Tbody, Tr, Th, Td, HStack, Text, Image, Box, 
  useToast, Spinner, useColorModeValue
} from '@chakra-ui/react';
import { vocationIcons } from '../../../constant/character';
import { GuildMemberResponse } from '../../../shared/interface/guild-member.interface';
import { copyExivas } from '../../../shared/utils/options-utils';
import { getTimeColor } from '../../../shared/utils/utils';
import { LocalInput } from '../local-input';
import { CharacterClassification } from './render-classification';

interface GuildMemberTableProps {
  data: GuildMemberResponse[];
  onLocalChange: (member: GuildMemberResponse, newLocal: string) => void;
  onClassificationChange: (member: GuildMemberResponse, newClassification: string) => void;
  showExivaInput: boolean;
  fontSize: string;
  types: string[];
  addType: (newType: string) => void;
  isLoading: boolean;
}

const ClassificationLegend: FC = () => (
  <HStack spacing={2} fontSize="xs" mb={1}>
    <Text>Tempo online:</Text>
    <HStack>
      <Box w={2} h={2} bg="red.500" rounded="full" />
      <Text>0-5min</Text>
    </HStack>
    <HStack>
      <Box w={2} h={2} bg="orange.500" rounded="full" />
      <Text>5-15min</Text>
    </HStack>
    <HStack>
      <Box w={2} h={2} bg="yellow.500" rounded="full" />
      <Text>15-30min</Text>
    </HStack>
  </HStack>
);

export const GuildMemberTable: FC<GuildMemberTableProps> = ({ 
  data, 
  onLocalChange, 
  onClassificationChange,
  showExivaInput,
  fontSize,
  types,
  addType,
  isLoading
}) => {
  const toast = useToast();
  const bgColor = useColorModeValue('gray.800', 'gray.900');
  const hoverBgColor = useColorModeValue('gray.700', 'gray.800');
  const textColor = useColorModeValue('white', 'gray.100');

  const handleNameClick = (e: React.MouseEvent, member: GuildMemberResponse) => {
    e.stopPropagation();
    copyExivas(member, toast);
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={4}>
        <Spinner />
        <Text mt={2} color={textColor}>Carregando...</Text>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} p={4} borderRadius="md">
      <ClassificationLegend />
      <Table variant="simple" size="sm" fontSize={fontSize} color={textColor}>
        <Thead>
          <Tr>
            <Th px={1} py={1} color={textColor}>#</Th>
            <Th px={1} py={1} color={textColor}>Personagem</Th>
            <Th px={1} py={1} color={textColor}>Lvl</Th>
            <Th px={1} py={1} color={textColor}>Tipo</Th>
            <Th px={1} py={1} color={textColor}>Tempo</Th>
            {showExivaInput && <Th px={1} py={1} color={textColor}>Local</Th>}
          </Tr>
        </Thead>
        <Tbody>
          {Array.isArray(data) && data.length > 0 ? (
            data.map((member, index) => (
              <Tr 
                key={member.Name}
                cursor="pointer"
                _hover={{ bg: hoverBgColor }}
              >
                <Td px={1} py={1}>{index + 1}</Td>
                <Td px={1} py={1}>
                  <HStack spacing={1}>
                    <Image src={vocationIcons[member.Vocation]} alt={member.Vocation} boxSize="12px" />
                    <Box 
                      onClick={(e) => handleNameClick(e, member)} 
                      cursor="pointer"
                      title="Clique para copiar exiva"
                    >
                      {member.Name}
                    </Box>
                  </HStack>
                </Td>
                <Td px={1} py={1}>{member.Level}</Td>
                <Td px={1} py={1}>
                  <CharacterClassification
                    member={member}
                    types={types}
                    onClassificationChange={onClassificationChange}
                    addType={addType}
                  />
                </Td>
                <Td px={1} py={1} color={getTimeColor(member.TimeOnline)}>{member.TimeOnline}</Td>
                {showExivaInput && (
                  <Td px={1} py={1}>
                    <Box title="Escreva para autocompletar com os respawns ou customize">
                      <LocalInput
                        member={member}
                        onLocalChange={onLocalChange}
                        fontSize={fontSize}
                        onClick={(e) => e.stopPropagation()} 
                      />
                    </Box>
                  </Td>
                )}
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={showExivaInput ? 6 : 5} textAlign="center">
                Sem dados para exibir
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  );
};