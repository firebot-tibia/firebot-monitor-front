import React, { FC } from 'react';
import { 
  Table, Thead, Tbody, Tr, Th, Td, HStack, Text, Image, Box, 
  useToast, Spinner, useColorModeValue, Badge, Flex,
  TableContainer, useMediaQuery, VStack
} from '@chakra-ui/react';
import { LocalInput } from './local-input';
import { CharacterClassification } from './render-classification';
import { vocationIcons } from '../../../constant/character';
import { GuildMemberResponse } from '../../../shared/interface/guild-member.interface';
import { copyExivas, getTimeColor } from '../../../shared/utils/utils';

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
                <Th px={responsivePadding} py={responsivePadding} color={textColor}>#</Th>
                <Th px={responsivePadding} py={responsivePadding} color={textColor}>Personagem</Th>
                <Th px={responsivePadding} py={responsivePadding} color={textColor} isNumeric>Lvl</Th>
                <Th px={responsivePadding} py={responsivePadding} color={textColor}>Tipo</Th>
                <Th px={responsivePadding} py={responsivePadding} color={textColor}>Tempo</Th>
                {showExivaInput && <Th px={responsivePadding} py={responsivePadding} color={textColor}>Local</Th>}
              </Tr>
            </Thead>
            <Tbody>
              {Array.isArray(data) && data.length > 0 ? (
                data.map((member, index) => (
                  <Tr 
                    key={member.Name}
                    _hover={{ bg: hoverBgColor }}
                  >
                    <Td px={responsivePadding} py={responsivePadding}>{index + 1}</Td>
                    <Td px={responsivePadding} py={responsivePadding}>
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
                    <Td px={responsivePadding} py={responsivePadding} isNumeric>{member.Level}</Td>
                    <Td px={responsivePadding} py={responsivePadding}>
                      <CharacterClassification
                        member={member}
                        types={types}
                        onClassificationChange={onClassificationChange}
                        addType={addType}
                      />
                    </Td>
                    <Td px={responsivePadding} py={responsivePadding} color={getTimeColor(member.TimeOnline)}>{member.TimeOnline}</Td>
                    {showExivaInput && (
                      <Td px={responsivePadding} py={responsivePadding}>
                        <Box title="Escreva para autocompletar com os respawns ou customize">
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
          {Array.isArray(data) && data.length > 0 ? (
            data.map((member, index) => renderMobileView(member, index))
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