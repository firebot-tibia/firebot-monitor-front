import React, { FC } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, VStack, HStack, Text, Image, Input, Box, Flex, IconButton, useToast } from '@chakra-ui/react';
import { GuildMemberResponse } from '../../shared/interface/guild-member.interface';
import { vocationIcons, characterTypeIcons } from '../../constant/character';
import { CopyIcon } from '@chakra-ui/icons';
import { handleCopy } from '../../shared/utils/options-utils';

interface GuildMemberTableProps {
  data: GuildMemberResponse[];
  onLocalChange: (member: GuildMemberResponse, newLocal: string) => void;
  onMemberClick: (member: GuildMemberResponse) => void;
  layout: 'horizontal' | 'vertical';
  showExivaInput: boolean;
  type: string;
}

export const GuildMemberTable: FC<GuildMemberTableProps> = ({ 
  data, 
  onLocalChange, 
  onMemberClick, 
  layout,
  showExivaInput,
  type
}) => {
  const toast = useToast();

  if (layout === 'vertical') {
    return (
      <VStack spacing={1} align="stretch">
        {data.map((member, index) => (
          <Box 
            key={member.Name}
            bg={index % 2 === 0 ? 'gray.700' : 'gray.600'} 
            p={1}
            rounded="md"
            onClick={() => onMemberClick(member)}
            cursor="pointer"
            fontSize="xs"
          >
            <Flex justify="space-between" align="center">
              <HStack spacing={1}>
                <Text fontWeight="bold" width="20px">#{index + 1}</Text>
                <Image src={vocationIcons[member.Vocation]} alt={member.Vocation} boxSize="14px" />
                <Text fontWeight="bold">{member.Name}</Text>
                <Text>Lvl {member.Level}</Text>
                <IconButton
                  aria-label="Copy exiva"
                  icon={<CopyIcon />}
                  size="xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(member.Name, toast);
                  }}
                />
              </HStack>
            </Flex>
            <Flex mt={1} justify="space-between" align="center">
              <HStack spacing={1}>
                <Image src={characterTypeIcons[member.Kind]} alt={member.Kind} boxSize="12px" />
                <Text>{member.Kind || 'n/a'}</Text>
              </HStack>
              <Text color={member.TimeOnline === '00:00:00' ? 'red.300' : 'inherit'}>
                {member.TimeOnline}
              </Text>
            </Flex>
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
    <Table variant="simple" size="sm" style={{ transform: 'scale(1.0)', transformOrigin: 'top left' }}>
      <Thead>
        <Tr>
          <Th fontSize="xs" width="50px">#</Th>
          <Th fontSize="xs">Personagem</Th>
          <Th fontSize="xs">Tipo</Th>
          <Th fontSize="xs">Tempo Online</Th>
          {showExivaInput && <Th fontSize="xs">Local</Th>}
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
            <Td fontSize="xs">{index + 1}</Td>
            <Td>
              <HStack spacing={1}>
                <Image src={vocationIcons[member.Vocation]} alt={member.Vocation} boxSize="14px" />
                <Text fontSize="xs">{member.Name}</Text>
                <IconButton
                  aria-label="Copy exiva"
                  icon={<CopyIcon />}
                  size="xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(member.Name, toast);
                  }}
                />
                <Text fontSize="xs">Lvl {member.Level}</Text>
              </HStack>
            </Td>
            <Td>
              <HStack spacing={1}>
                <Image src={characterTypeIcons[member.Kind]} alt={member.Kind} boxSize="12px" />
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
                  size="xs"
                  width="100%"
                  minWidth="120px"
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