import React, { FC } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, VStack, HStack, Text, Image, Box, Flex, IconButton, useToast, Tooltip } from '@chakra-ui/react';
import { GuildMemberResponse } from '../../shared/interface/guild-member.interface';
import { vocationIcons, characterTypeIcons } from '../../constant/character';
import { CopyIcon } from '@chakra-ui/icons';
import { LocalInput } from './local-input';

interface GuildMemberTableProps {
  data: GuildMemberResponse[];
  onLocalChange: (member: GuildMemberResponse, newLocal: string) => void;
  onMemberClick: (member: GuildMemberResponse) => void;
  layout: 'horizontal' | 'vertical';
  showExivaInput: boolean;
  fontSize: string;
}

const getTimeColor = (timeOnline: string) => {
  const [hours, minutes] = timeOnline.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  
  if (totalMinutes <= 5) return 'red.500';
  if (totalMinutes <= 15) return 'orange.500';
  if (totalMinutes <= 30) return 'yellow.500';
  return 'inherit';
};

const copyExivas = (data: GuildMemberResponse, toast: ReturnType<typeof useToast>) => {
  const exivas = `exiva "${data.Name.trim().toLowerCase()}"`;
  navigator.clipboard.writeText(exivas);
  toast({
    title: 'Exiva copiado para a área de transferência.',
    status: 'success',
    duration: 2000,
    isClosable: true,
  });
};

const ClassificationLegend: FC = () => (
  <Tooltip label="Legenda de Classificação" placement="top">
    <HStack spacing={2} fontSize="xs">
      <Text>Classificação:</Text>
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
  </Tooltip>
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

  if (layout === 'vertical') {
    return (
      <VStack spacing={1} align="stretch">
        <ClassificationLegend />
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
                    copyExivas(member, toast);
                  }}
                />
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
                      copyExivas(member, toast);
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
              <Td fontSize={fontSize} color={getTimeColor(member.TimeOnline)}>{member.TimeOnline}</Td>
              {showExivaInput && (
                <Td>
                  <LocalInput
                    member={member}
                    onLocalChange={onLocalChange}
                    fontSize={fontSize}
                    onClick={(e) => e.stopPropagation()} 
                  />
                </Td>
              )}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};