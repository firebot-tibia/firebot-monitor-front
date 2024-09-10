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
  fontSize: string;
}

export const GuildMemberTable: FC<GuildMemberTableProps> = ({ 
  data, 
  onLocalChange, 
  onMemberClick, 
  layout,
  showExivaInput,
  type,
  fontSize
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
            fontSize={fontSize}
          >
            <Flex justify="space-between" align="center">
              <HStack spacing={1}>
                <Text fontWeight="bold" width="14px">#{index + 1}</Text>
                <Image src={vocationIcons[member.Vocation]} alt={member.Vocation} boxSize="12px" />
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
                <Image src={characterTypeIcons[member.Kind]} alt={member.Kind} boxSize="10px" />
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
                fontSize={fontSize}
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
          <Th fontSize={fontSize} width="30px">#</Th>
          <Th fontSize={fontSize}>Personagem</Th>
          <Th fontSize={fontSize}>Tipo</Th>
          <Th fontSize={fontSize}>Tempo</Th>
          {showExivaInput && <Th fontSize={fontSize}>Local</Th>}
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
            <Td fontSize={fontSize}>{index + 1}</Td>
            <Td>
              <HStack spacing={1}>
                <Image src={vocationIcons[member.Vocation]} alt={member.Vocation} boxSize="12px" />
                <Text fontSize={fontSize}>{member.Name}</Text>
                <Text fontSize={fontSize}>Lvl {member.Level}</Text>
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
            </Td>
            <Td>
              <HStack spacing={1}>
                <Image src={characterTypeIcons[member.Kind]} alt={member.Kind} boxSize="10px" />
                <Text fontSize={fontSize}>{member.Kind || 'n/a'}</Text>
              </HStack>
            </Td>
            <Td fontSize={fontSize} color={member.TimeOnline === '00:00:00' ? 'red.300' : 'inherit'}>{member.TimeOnline}</Td>
            {showExivaInput && (
              <Td>
                <Input
                  placeholder="Local"
                  defaultValue={member.Local || ''}
                  bg="gray.800"
                  size="xs"
                  fontSize={fontSize}
                  width="100%"
                  minWidth="80px"
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