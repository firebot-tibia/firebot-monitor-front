import { FC, useMemo, useState } from 'react';
import {
  Table, Thead, Tbody, Tr, Th, Td, HStack, Text, Image, Box,
  useToast, Spinner, useColorModeValue, Tag, Flex,
  TableContainer, useMediaQuery,
  IconButton
} from '@chakra-ui/react';
import { LocalInput } from './local-input';
import { CharacterClassification } from './render-classification';
import { TableVocationIcons } from '../../../constant/character';
import { GuildMemberResponse } from '../../../shared/interface/guild/guild-member.interface';
import { copyExivas, getTimeColor } from '../../../shared/utils/utils';
import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react';

interface GuildMemberTableProps {
  data: GuildMemberResponse[];
  onLocalChange: (member: GuildMemberResponse, newLocal: string) => void;
  onClassificationChange: (member: GuildMemberResponse, newClassification: string) => void;
  showExivaInput: boolean;
  types: string[];
  addType: (newType: string) => void;
  isLoading: boolean;
  onlineCount: number;
}

type SortField = 'Level' | 'TimeOnline' | 'Vocation';
type SortOrder = 'asc' | 'desc';

const ClassificationLegend: FC = () => (
  <HStack spacing={2} fontSize="2xs" mb={1}>
    <Text>Tempo online:</Text>
    <HStack spacing={1}>
      <Box w={2} h={2} bg="red.500" rounded="full" />
      <Text>0-5min</Text>
    </HStack>
    <HStack spacing={1}>
      <Box w={2} h={2} bg="orange.500" rounded="full" />
      <Text>5-15min</Text>
    </HStack>
    <HStack spacing={1}>
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
  types,
  addType,
  isLoading,
  onlineCount
}) => {
  const [sortField, setSortField] = useState<SortField>('TimeOnline');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const toast = useToast();
  const bgColor = useColorModeValue('black.800', 'black.900');
  const hoverBgColor = useColorModeValue('red.700', 'red.800');
  const textColor = useColorModeValue('white', 'gray.100');

  const [isLargerThan1200] = useMediaQuery("(min-width: 1200px)");
  const [isLargerThan992] = useMediaQuery("(min-width: 992px)");

  const responsiveFontSize = isLargerThan1200 ? "2xs" : isLargerThan992 ? "3xs" : "4xs";
  const responsivePadding = isLargerThan1200 ? 0.5 : 0.25;

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
          comparison = parseInt(a.TimeOnline) - parseInt(b.TimeOnline);
          break;
        case 'Vocation':
          comparison = a.Vocation.localeCompare(b.Vocation);
          break;
      }
      return sortOrder === 'asc' ? -comparison : comparison;
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
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box bg={bgColor} p={2} borderRadius="xs" maxWidth="100%" overflow="hidden" style={{ zoom: `${100}%` }}>
      <Flex justify="space-between" align="center" mb={2}>
        <ClassificationLegend />
        <HStack>
          <Tag size="sm" colorScheme="green" fontSize={responsiveFontSize}>
            {onlineCount} online
          </Tag>
        </HStack>
      </Flex>
      <TableContainer overflowX="auto">
        <Table variant="simple" size="xs" fontSize={responsiveFontSize} color={textColor}>
          <Thead position="sticky" top={0} bg={bgColor} zIndex={1}>
            <Tr>
              <Th px={1} py={responsivePadding} color={textColor} width="2%">#</Th>
              <Th px={1} py={responsivePadding} color={textColor} width="18%">Personagem <SortIcon field="Vocation" /></Th>
              <Th px={1} py={responsivePadding} color={textColor} isNumeric width="5%">Lvl <SortIcon field="Level" /></Th>
              {isLargerThan992 && <Th px={1} py={responsivePadding} color={textColor} width="8%">Tipo</Th>}
              <Th px={1} py={responsivePadding} color={textColor} width="10%">Tempo <SortIcon field="TimeOnline" /></Th>
              {showExivaInput && <Th px={1} py={responsivePadding} color={textColor} width="45%">Local</Th>}
            </Tr>
          </Thead>
          <Tbody>
            {Array.isArray(sortedData) && sortedData.length > 0 ? (
              sortedData.map((member, index) => (
                <Tr key={member.Name} _hover={{ bg: hoverBgColor }}>
                  <Td px={0.5} py={responsivePadding} width="2%">{index + 1}</Td>
                  <Td px={0.5} py={responsivePadding} width="18%">
                    <Flex alignItems="center" maxWidth="100%">
                      <Image src={TableVocationIcons[member.Vocation]} alt={member.Vocation} boxSize={isLargerThan992 ? "16px" : "14px"} mr={1} flexShrink={0} />
                      <Box
                        onClick={() => handleNameClick(member)}
                        cursor="pointer"
                        title="Clique para copiar exiva"
                        isTruncated
                        maxWidth="calc(100% - 15px)"
                      >
                        {member.Name}
                      </Box>
                    </Flex>
                  </Td>
                  <Td px={0.5} py={responsivePadding} isNumeric width="5%">{member.Level}</Td>
                  {isLargerThan992 && (
                    <Td px={0.5} py={responsivePadding} width="8%">
                      <CharacterClassification
                        member={member}
                        types={types}
                        onClassificationChange={onClassificationChange}
                        addType={addType}
                      />
                    </Td>
                  )}
                  <Td px={0.5} py={responsivePadding} color={getTimeColor(member.TimeOnline)} width="10%">{member.TimeOnline}</Td>
                  {showExivaInput && (
                    <Td px={0.5} py={responsivePadding} width="45%">
                      <Box title="Escreva para autocompletar com os respawns ou customize" width="100%">
                        <LocalInput
                          member={member}
                          onLocalChange={onLocalChange}
                          fontSize={"md"}
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
    </Box>
  );
};