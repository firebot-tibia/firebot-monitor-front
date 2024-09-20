import React, { useState } from 'react';
import {
  Box,
  Heading,
  StatGroup,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  useDisclosure,
} from '@chakra-ui/react';
import { Vocations } from '../../../constant/character';
import { GuildData, GuildMember } from '../../../shared/interface/guild-stats.interface';
import { Pagination } from '../../pagination';
import ExpStats from '../exp-stats';
import PlayerModal from '../player-modal';

interface GuildTableProps {
  guildType: 'ally' | 'enemy';
  guildData: GuildData;
  currentPage: number;
  filter: string;
  onPageChange: (page: number) => void;
  onCharacterClick: (characterName: string) => void;
}

const GuildTable: React.FC<GuildTableProps> = ({
  guildType,
  guildData,
  currentPage,
  filter,
  onPageChange,
  onCharacterClick,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);

  const handleRowClick = (characterName: string) => {
    setSelectedCharacter(characterName);
    onCharacterClick(characterName);
    onOpen();
  };

  return (
    <Box width="100%">
      <Heading as="h2" size="md" mb={2} textAlign="left">
        {guildType === 'ally' ? 'Aliados' : 'Inimigos'}
      </Heading>
      <StatGroup mb={4}>
        <ExpStats totalExp={guildData.totalExp} avgExp={guildData.avgExp} filter={filter} />
      </StatGroup>
      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th p={1}>EXP</Th>
              <Th p={1} textAlign="center">VOC</Th>
              <Th p={1}>NOME</Th>
              <Th p={1} isNumeric>LVL</Th>
              <Th p={1} textAlign="center">STATUS</Th>
            </Tr>
          </Thead>
          <Tbody>
            {guildData.data.map((item: GuildMember, index: number) => (
              <Tr 
                key={index} 
                onClick={() => handleRowClick(item.name)} 
                _hover={{ bg: 'gray.600', cursor: 'pointer' }}
                transition="background-color 0.2s"
              >
                <Td p={1}>{item.experience}</Td>
                <Td p={1} textAlign="center">
                  <Image src={Vocations[item.vocation]} alt={item.vocation} boxSize="24px" display="inline-block" />
                </Td>
                <Td p={1}>{item.name}</Td>
                <Td p={1} isNumeric>{item.level}</Td>
                <Td p={1} textAlign="center">
                  <Box
                    as="span"
                    display="inline-block"
                    w={3}
                    h={3}
                    borderRadius="full"
                    bg={item.online ? 'green.500' : 'red.500'}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      <Box mt={4}>
        <Pagination
          currentPage={currentPage}
          totalPages={guildData.totalPages}
          onPageChange={onPageChange}
        />
      </Box>
      <PlayerModal 
        isOpen={isOpen} 
        onClose={onClose} 
        characterName={selectedCharacter} 
      />
    </Box>
  );
};

export default GuildTable;