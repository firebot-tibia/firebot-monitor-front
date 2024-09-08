import React, { FC } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, VStack, HStack, Text, Image, Input, Box } from '@chakra-ui/react';
import { GuildMemberResponse } from '../../shared/interface/guild-member.interface';
import { vocationIcons, characterTypeIcons } from '../../constant/character';

interface GuildMemberTableProps {
  data: GuildMemberResponse[];
  onLocalChange: (member: GuildMemberResponse, newLocal: string) => void;
  onMemberClick: (member: GuildMemberResponse) => void;
  layout: 'horizontal' | 'vertical';
  showExivaInput: boolean;
}

export const GuildMemberTable: FC<GuildMemberTableProps> = ({ 
  data, 
  onLocalChange, 
  onMemberClick, 
  layout,
  showExivaInput
}) => {
  if (layout === 'vertical') {
    return (
      <VStack spacing={2} align="stretch">
        {data.map((member, index) => (
          <Box 
            key={member.Name}
            bg={index % 2 === 0 ? 'gray.700' : 'gray.600'} 
            p={2}
            rounded="md"
            onClick={() => onMemberClick(member)}
            cursor="pointer"
          >
            <HStack spacing={2} justify="space-between">
              <HStack spacing={2}>
                <Image src={vocationIcons[member.Vocation]} alt={member.Vocation} boxSize="16px" />
                <Text fontSize="sm" fontWeight="bold">{member.Name}</Text>
                <Text fontSize="xs">Lvl {member.Level}</Text>
              </HStack>
            </HStack>
            <HStack mt={1} spacing={2} justify="space-between">
              <HStack spacing={2}>
                <Image src={characterTypeIcons[member.Kind]} alt={member.Kind} boxSize="14px" />
                <Text fontSize="xs">{member.Kind || 'n/a'}</Text>
              </HStack>
              <Text fontSize="xs" color={member.TimeOnline === '00:00:00' ? 'red.300' : 'inherit'}>
                {member.TimeOnline}
              </Text>
            </HStack>
            {showExivaInput && (
              <Input
                mt={1}
                placeholder="Local"
                defaultValue={member.Local || ''}
                bg="gray.800"
                size="xs"
                onChange={(e) => onLocalChange(member, e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </Box>
        ))}
      </VStack>
    );
  }

  return (
    <Table variant="simple" size="sm">
      <Thead>
        <Tr>
          <Th fontSize="xs">Personagem</Th>
          <Th fontSize="xs">Tipo</Th>
          <Th fontSize="xs">Tempo Online</Th>
          {showExivaInput && <Th fontSize="xs">Local</Th>}
        </Tr>
      </Thead>
      <Tbody>
        {data.map((member) => (
          <Tr 
            key={member.Name}
            onClick={() => onMemberClick(member)}
            cursor="pointer"
            _hover={{ bg: 'gray.700' }}
          >
            <Td>
              <HStack spacing={2}>
                <Image src={vocationIcons[member.Vocation]} alt={member.Vocation} boxSize="16px" />
                <Text fontSize="sm">{member.Name}</Text>
                <Text fontSize="xs">Lvl {member.Level}</Text>
              </HStack>
            </Td>
            <Td>
              <HStack spacing={2}>
                <Image src={characterTypeIcons[member.Kind]} alt={member.Kind} boxSize="14px" />
                <Text fontSize="xs">{member.Kind || 'n/a'}</Text>
              </HStack>
            </Td>
            <Td fontSize="xs" color={member.TimeOnline === '00:00:00' ? 'red.300' : 'inherit'}>{member.TimeOnline}</Td>
            {showExivaInput && (
              <Td>
                <Input
                  placeholder="Local"
                  defaultValue={member.Local || ''}
                  bg="gray.800"
                  size="sm"
                  width="100%"
                  minWidth="150px"
                  onChange={(e) => onLocalChange(member, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </Td>
            )}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};