import React, { FC, useMemo } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, Image, Input, Flex, Box } from '@chakra-ui/react';
import { GuildMemberResponse } from '../../shared/interface/guild-member.interface';
import { vocationIcons, characterTypeIcons } from '../../constant/character';

interface GuildMemberTableProps {
  data: GuildMemberResponse[];
  onLocalChange: (member: GuildMemberResponse, newLocal: string) => void;
  onMemberClick: (member: GuildMemberResponse) => void;
}

export const GuildMemberTable: FC<GuildMemberTableProps> = ({ data, onLocalChange, onMemberClick }) => {
  const columns = useMemo(() => ['#', 'Lvl', 'Voc', 'Nome', 'Tipo', 'Tempo', 'Exiva'], []);

  return (
    <Box overflowX="auto" w="full">
      <Table variant="simple" size="sm" colorScheme="whiteAlpha">
        <Thead bg="gray.800">
          <Tr>
            {columns.map((column, index) => (
              <Th key={index} textAlign="center" color="gray.300" py={2} fontSize="xs">{column}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data.map((member, index) => (
            <Tr 
              key={member.Name}
              bg={index % 2 === 0 ? 'gray.700' : 'gray.600'} 
              _hover={{ bg: 'gray.500', cursor: 'pointer' }} 
              onClick={() => onMemberClick(member)}
            >
              <Td textAlign="center" fontWeight="bold" py={1} fontSize="xs">{index + 1}</Td>
              <Td textAlign="center" py={1} fontSize="xs">{member.Level}</Td>
              <Td textAlign="center" py={1} fontSize="xs">
                <Image src={vocationIcons[member.Vocation]} alt={member.Vocation} boxSize="16px" mx="auto" />
              </Td>
              <Td textAlign="left" maxW="xs" isTruncated py={1} fontSize="xs">{member.Name}</Td>
              <Td textAlign="center" py={1} fontSize="xs">
                <Flex alignItems="center" justifyContent="center">
                  <Image src={characterTypeIcons[member.Kind]} alt={member.Kind} boxSize="14px" mr={2} />
                  {member.Kind || 'n/a'}
                </Flex>
              </Td>
              <Td textAlign="center" fontFamily="monospace" py={1} fontSize="xs" color={member.TimeOnline === '00:00:00' ? 'red.300' : 'inherit'}>
                {(member.TimeOnline)}
              </Td>
              <Td textAlign="center" py={1} fontSize="xs">
                <Input
                  defaultValue={member.Local || ''}
                  bg="gray.800"
                  p={1}
                  rounded="md"
                  color="white"
                  textAlign="center"
                  w="full"
                  minW="90px"
                  fontSize="xs"
                  onChange={(e) => onLocalChange(member, e.target.value)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};