import React, { FC } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, VStack, HStack, Text, Image, Box, Flex, useToast, Tooltip } from '@chakra-ui/react';
import { GuildMemberResponse } from '../../shared/interface/guild-member.interface';
import { vocationIcons, characterTypeIcons } from '../../constant/character';
import { LocalInput } from './local-input';
import { copyExivas } from '../../shared/utils/options-utils';
import { getTimeColor } from '../../shared/utils/utils';

interface GuildMemberTableProps {
  data: GuildMemberResponse[];
  onLocalChange: (member: GuildMemberResponse, newLocal: string) => void;
  onMemberClick: (member: GuildMemberResponse) => void;
  layout: 'horizontal' | 'vertical';
  showExivaInput: boolean;
  fontSize: string;
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
  onMemberClick, 
  layout,
  showExivaInput,
  fontSize
}) => {
  const toast = useToast();

  const handleNameClick = (e: React.MouseEvent, member: GuildMemberResponse) => {
    e.stopPropagation();
    copyExivas(member, toast);
  };

  if (layout === 'vertical') {
    return (
      <VStack spacing={0} align="stretch">
        <ClassificationLegend />
        {data.map((member, index) => (
          <Box 
            key={member.Name}
            bg={index % 2 === 0 ? 'gray.700' : 'gray.600'} 
            p={1}
            onClick={() => onMemberClick(member)}
            cursor="pointer"
            fontSize={fontSize}
            borderBottom="1px solid"
            borderColor="gray.600"
          >
            <Flex justify="space-between" align="center">
              <HStack spacing={1}>
                <Text width="14px">{index + 1}</Text>
                <Image src={vocationIcons[member.Vocation]} alt={member.Vocation} boxSize="12px" />
                <Tooltip label="Clique para copiar exiva">
                  <Text fontWeight="bold" onClick={(e) => handleNameClick(e, member)} cursor="pointer">{member.Name}</Text>
                </Tooltip>
                <Text>Lvl {member.Level}</Text>
              </HStack>
              <HStack spacing={1}>
                <Image src={characterTypeIcons[member.Kind]} alt={member.Kind} boxSize="10px" />
                <Text>{member.Kind || 'n/a'}</Text>
                <Text color={getTimeColor(member.TimeOnline)}>{member.TimeOnline}</Text>
              </HStack>
            </Flex>
            {showExivaInput && (
              <LocalInput
                member={member}
                onLocalChange={onLocalChange}
                fontSize={fontSize}
                onClick={(e) => e.stopPropagation()} 
              />
            )}
          </Box>
        ))}
      </VStack>
    );
  }

  return (
    <Box>
      <ClassificationLegend />
      <Table variant="simple" size="sm" fontSize={fontSize}>
        <Thead>
          <Tr>
            <Th px={1} py={1}>#</Th>
            <Th px={1} py={1}>Personagem</Th>
            <Th px={1} py={1}>Lvl</Th>
            <Th px={1} py={1}>Tipo</Th>
            <Th px={1} py={1}>Tempo</Th>
            {showExivaInput && <Th px={1} py={1}>Local</Th>}
          </Tr>
        </Thead>
        <Tbody>
          {data.map((member, index) => (
            <Tr 
              key={member.Name}
              onClick={() => onMemberClick(member)}
              cursor="pointer"
              _hover={{ bg: 'gray.700' }}
            >
              <Td px={1} py={1}>{index + 1}</Td>
              <Td px={1} py={1}>
                <HStack spacing={1}>
                  <Image src={vocationIcons[member.Vocation]} alt={member.Vocation} boxSize="12px" />
                  <Tooltip label="Clique para copiar exiva">
                    <Text onClick={(e) => handleNameClick(e, member)} cursor="pointer">{member.Name}</Text>
                  </Tooltip>
                </HStack>
              </Td>
              <Td px={1} py={1}>
                <HStack spacing={1}>
                  <Text>{member.Level}</Text>
                </HStack>
              </Td>
              <Td px={1} py={1}>
                <HStack spacing={1}>
                  <Image src={characterTypeIcons[member.Kind]} alt={member.Kind} boxSize="10px" />
                  <Text>{member.Kind || 'n/a'}</Text>
                </HStack>
              </Td>
              <Td px={1} py={1} color={getTimeColor(member.TimeOnline)}>{member.TimeOnline}</Td>
              {showExivaInput && (
                <Td px={1} py={1}>
                  <Tooltip label="Escreva para autocompletar com os respawns ou customize">
                    <LocalInput
                      member={member}
                      onLocalChange={onLocalChange}
                      fontSize={fontSize}
                      onClick={(e) => e.stopPropagation()} 
                    />
                  </Tooltip>
                </Td>
              )}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};