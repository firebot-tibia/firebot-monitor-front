import React, { FC, useMemo, useState } from 'react';
import { 
  Table, Thead, Tbody, Tr, Th, Td, HStack, Text, Image, Box, 
  useToast, Spinner, useColorModeValue, Badge, Flex,
  TableContainer, useMediaQuery, VStack,
  IconButton
} from '@chakra-ui/react';
import { LocalInput } from './local-input';
import { CharacterClassification } from './render-classification';
import { vocationIcons } from '../../../constant/character';
import { GuildMemberResponse } from '../../../shared/interface/guild-member.interface';
import { copyExivas, getTimeColor } from '../../../shared/utils/utils';
import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react';

interface GuildMemberTableProps {
  data: GuildMemberResponse[];
  onLocalChange: (member: GuildMemberResponse, newLocal: string) => void;
  onClassificationChange: (member: GuildMemberResponse, newClassification: string) => void;
  showExivaInput: boolean;
  fontSize: string;
  types: string[];
  addType: (newType: string) => void;
  isLoading: boolean;
  onlineCount: number;
}

type SortField = 'Level' | 'TimeOnline' | 'Vocation';
type SortOrder = 'asc' | 'desc';


const ClassificationLegend: FC = () => (
  <VStack spacing={1} fontSize="xs" mb={2} align="flex-start">
    <Text>Tempo online:</Text>
    <HStack spacing={2}>
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
  </VStack>
);

export const GuildMemberTable: FC<GuildMemberTableProps> = ({ 
  data, 
  onLocalChange, 
  onClassificationChange,
  showExivaInput,
  fontSize,
  types,
  addType,
  isLoading,
  onlineCount
}) => {
  const [sortField, setSortField] = useState<SortField>('TimeOnline');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const toast = useToast();
  const bgColor = useColorModeValue('gray.800', 'gray.900');
  const hoverBgColor = useColorModeValue('gray.700', 'gray.800');
  const textColor = useColorModeValue('white', 'gray.100');

  const [isLargerThan1200] = useMediaQuery("(min-width: 1200px)");
  const [isLargerThan992] = useMediaQuery("(min-width: 992px)");
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");

  const responsiveFontSize = isLargerThan1200 ? fontSize : isLargerThan992 ? "sm" : isLargerThan768 ? "xs" : "2xs";
  const responsivePadding = isLargerThan1200 ? 2 : 1;

  const handleNameClick = (member: GuildMemberResponse) => {
    copyExivas(member, toast);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'Level':
          comparison = a.Level - b.Level;
          break;
        case 'TimeOnline':
          comparison = a.TimeOnline.localeCompare(b.TimeOnline);
          break;
        case 'Vocation':
          comparison = a.Vocation.localeCompare(b.Vocation);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [data, sortField, sortOrder]);

  const SortIcon: FC<{ field: SortField }> = ({ field }) => (
    <IconButton
      aria-label={`Sort by ${field}`}
      icon={sortField === field ? (sortOrder === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />) : <ChevronUpIcon />}
      size="xs"
      variant="ghost"
      onClick={() => handleSort(field)}
    />
  );

  if (isLoading) {
    return (
      <Box textAlign="center" py={4}>
        <Spinner />
        <Text mt={2} color={textColor}>Carregando...</Text>
      </Box>
    );
  }

  const renderMobileView = (member: GuildMemberResponse, index: number) => (
    <Box 
      key={member.Name}
      p={2}
      borderBottom="1px"
      borderColor="gray.600"
      _hover={{ bg: hoverBgColor }}
    >
      <Flex justifyContent="space-between" alignItems="center" mb={1}>
        <HStack>
          <Text fontWeight="bold">{index + 1}.</Text>
          <Image src={vocationIcons[member.Vocation]} alt={member.Vocation} boxSize="12px" mr={1} />
          <Text 
            fontWeight="bold" 
            onClick={() => handleNameClick(member)}
            cursor="pointer"
            title="Clique para copiar exiva"
          >
            {member.Name}
          </Text>
        </HStack>
        <Text>Lvl {member.Level}</Text>
      </Flex>
      <Flex justifyContent="space-between" alignItems="center" mb={1}>
        <CharacterClassification
          member={member}
          types={types}
          onClassificationChange={onClassificationChange}
          addType={addType}
        />
        <Text color={getTimeColor(member.TimeOnline)}>{member.TimeOnline}</Text>
      </Flex>
      {showExivaInput && (
        <Box mt={1}>
          <LocalInput
            member={member}
            onLocalChange={onLocalChange}
            fontSize={responsiveFontSize}
            onClick={(e) => e.stopPropagation()} 
          />
        </Box>
      )}
    </Box>
  );

  return (
    <Box bg={bgColor} p={responsivePadding} borderRadius="md">
    <VStack spacing={2} align="stretch" mb={4}>
      <ClassificationLegend />
      <Badge colorScheme="green" fontSize={responsiveFontSize} alignSelf="flex-end">
        {onlineCount} online
      </Badge>
    </VStack>
    {isLargerThan768 ? (
      <TableContainer overflowX="auto" maxWidth="100%">
        <Table variant="simple" size="sm" fontSize={responsiveFontSize} color={textColor}>
          <Thead>
            <Tr>
              <Th px={1} py={responsivePadding} color={textColor} width="3%">#</Th>
              <Th px={1} py={responsivePadding} color={textColor} width="20%">Personagem <SortIcon field="Vocation" /></Th>
              <Th px={1} py={responsivePadding} color={textColor} isNumeric width="7%">
                Lvl <SortIcon field="Level" />
              </Th>
              <Th px={1} py={responsivePadding} color={textColor} width="8%">Tipo</Th>
              <Th px={1} py={responsivePadding} color={textColor} width="12%">
                Tempo <SortIcon field="TimeOnline" />
              </Th>
              {showExivaInput && <Th px={1} py={responsivePadding} color={textColor} width="50%">Local</Th>}
            </Tr>
          </Thead>
          <Tbody>
            {Array.isArray(sortedData) && sortedData.length > 0 ? (
              sortedData.map((member, index) => (
                <Tr 
                  key={member.Name}
                  _hover={{ bg: hoverBgColor }}
                >
                  <Td px={0.8} py={responsivePadding} width="3%">{index + 1}</Td>
                  <Td px={0.3} py={responsivePadding} width="10%">
                    <Flex alignItems="center" maxWidth="100%">
                      <Image src={vocationIcons[member.Vocation]} alt={member.Vocation} boxSize={isLargerThan992 ? "12px" : "10px"} mr={1} flexShrink={0} />
                      <Box 
                        onClick={() => handleNameClick(member)}
                        cursor="pointer"
                        title="Clique para copiar exiva"
                        isTruncated
                        maxWidth="calc(100% - 20px)"
                      >
                        {member.Name}
                      </Box>
                    </Flex>
                  </Td>
                  <Td px={1} py={responsivePadding} isNumeric width="7%">{member.Level}</Td>
                  <Td px={1} py={responsivePadding} width="8%">
                    <CharacterClassification
                      member={member}
                      types={types}
                      onClassificationChange={onClassificationChange}
                      addType={addType}
                    />
                  </Td>
                  <Td px={1} py={responsivePadding} color={getTimeColor(member.TimeOnline)} width="12%">{member.TimeOnline}</Td>
                  {showExivaInput && (
                    <Td px={1} py={responsivePadding} width="50%">
                      <Box title="Escreva para autocompletar com os respawns ou customize" width="100%">
                        <LocalInput
                          member={member}
                          onLocalChange={onLocalChange}
                          fontSize={responsiveFontSize}
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
      </TableContainer>
      ) : (
        <VStack spacing={2} align="stretch">
          {Array.isArray(sortedData) && sortedData.length > 0 ? (
            sortedData.map((member, index) => renderMobileView(member, index))
          ) : (
            <Box textAlign="center" p={2}>
              Sem dados para exibir
            </Box>
          )}
        </VStack>
      )}
    </Box>
  );
};