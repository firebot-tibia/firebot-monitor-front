import React, { FC, useState } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, VStack, HStack, Text, Image, Box, Flex, useToast, Tooltip, Menu, MenuButton, MenuList, MenuItem, Button } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { characterTypeIcons, vocationIcons } from '../../../constant/character';
import { GuildMemberResponse } from '../../../shared/interface/guild-member.interface';
import { copyExivas } from '../../../shared/utils/options-utils';
import { getTimeColor } from '../../../shared/utils/utils';
import { LocalInput } from '../local-input';

interface GuildMemberTableProps {
  data: GuildMemberResponse[];
  onLocalChange: (member: GuildMemberResponse, newLocal: string) => void;
  onClassificationChange: (member: GuildMemberResponse, newClassification: string) => void;
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

const characterTypes = ['main', 'maker', 'bomba', 'fracoks', 'exitados', 'mwall', 'unclassified'];

export const GuildMemberTable: FC<GuildMemberTableProps> = ({ 
  data, 
  onLocalChange, 
  onClassificationChange,
  layout,
  showExivaInput,
  fontSize
}) => {
  const toast = useToast();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const handleNameClick = (e: React.MouseEvent, member: GuildMemberResponse) => {
    e.stopPropagation();
    copyExivas(member, toast);
  };

  const handleClassificationClick = (e: React.MouseEvent, member: GuildMemberResponse, newType: string) => {
    e.stopPropagation();
    onClassificationChange(member, newType);
    setOpenMenus(prev => ({ ...prev, [member.Name]: false }));
  };

  const toggleMenu = (e: React.MouseEvent, memberName: string) => {
    e.stopPropagation();
    setOpenMenus(prev => ({ ...prev, [memberName]: !prev[memberName] }));
  };

  const renderClassification = (member: GuildMemberResponse) => (
    <Menu isOpen={openMenus[member.Name]} onClose={() => setOpenMenus(prev => ({ ...prev, [member.Name]: false }))}>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        onClick={(e) => toggleMenu(e, member.Name)}
        size="xs"
        variant="ghost"
      >
        <HStack spacing={1}>
          <Image src={characterTypeIcons[member.Kind]} alt={member.Kind} boxSize="10px" />
          <Box as="span">{member.Kind || 'n/a'}</Box>
        </HStack>
      </MenuButton>
      <MenuList>
        {characterTypes.map((type) => (
          <MenuItem key={type} onClick={(e) => handleClassificationClick(e, member, type)}>
            {type}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );

  const renderMemberRow = (member: GuildMemberResponse, index: number) => (
    <Box 
      key={member.Name}
      bg={index % 2 === 0 ? 'gray.700' : 'gray.600'} 
      p={1}
      cursor="pointer"
      fontSize={fontSize}
      borderBottom="1px solid"
      borderColor="gray.600"
    >
      <Flex justify="space-between" align="center">
        <HStack spacing={1}>
          <Box width="14px">{index + 1}</Box>
          <Image src={vocationIcons[member.Vocation]} alt={member.Vocation} boxSize="12px" />
          <Box 
            fontWeight="bold" 
            onClick={(e) => handleNameClick(e, member)} 
            cursor="pointer"
            title="Clique para copiar exiva"
          >
            {member.Name}
          </Box>
          <Box>Lvl {member.Level}</Box>
        </HStack>
        <HStack spacing={1}>
          {renderClassification(member)}
          <Box color={getTimeColor(member.TimeOnline)}>{member.TimeOnline}</Box>
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
  );

  if (layout === 'vertical') {
    return (
      <VStack spacing={0} align="stretch">
        <ClassificationLegend />
        {data.map((member, index) => renderMemberRow(member, index))}
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
              cursor="pointer"
              _hover={{ bg: 'gray.700' }}
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
              <Td px={1} py={1}>
                <HStack spacing={1}>
                  <Box>{member.Level}</Box>
                </HStack>
              </Td>
              <Td px={1} py={1}>
                {renderClassification(member)}
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
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};