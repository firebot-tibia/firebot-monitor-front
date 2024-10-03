import React, { useState, useMemo } from 'react';
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
  Spinner,
  Center,
} from '@chakra-ui/react';
import { Vocations } from '../../../../constant/character';
import { GuildData, GuildMember } from '../../../../shared/interface/guild/guild-stats.interface';
import ExpStats from '../exp-stats';
import PlayerModal from '../player-modal';

interface GuildTableProps {
  guildType: 'allyGain' | 'allyLoss' | 'enemyGain' | 'enemyLoss';
  guildData: GuildData;
  currentPage: number;
  filter: string;
  onCharacterClick: (characterName: string) => void;
  renderCharacterName: (character: GuildMember) => React.ReactNode;
  isLoading: boolean;
}

const GuildTable: React.FC<GuildTableProps> = ({
  guildType,
  guildData,
  filter,
  onCharacterClick,
  renderCharacterName,
  isLoading,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);

  const handleRowClick = (characterName: string) => {
    setSelectedCharacter(characterName);
    onCharacterClick(characterName);
    onOpen();
  };

  const tableRows = useMemo(() => {
    if (isLoading) {
      return (
        <Tr>
          <Td colSpan={5}>
            <Center py={4}>
              <Spinner size="xl" />
            </Center>
          </Td>
        </Tr>
      );
    }

    return guildData.data.map((item: GuildMember, index: number) => (
      <Tr
        key={item.name}
        _hover={{ bg: 'gray.600', cursor: 'pointer' }}
        transition="background-color 0.2s"
      >
        <Td p={1}>{item.experience}</Td>
        <Td p={1} textAlign="center">
          <Image src={Vocations[item.vocation]} alt={item.vocation} boxSize="24px" display="inline-block" />
        </Td>
        <Td p={1} onClick={() => handleRowClick(item.name)}>
          {renderCharacterName(item)}
        </Td>
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
    ));
  }, [guildData.data, handleRowClick, renderCharacterName, isLoading]);

  return (
    <Box width="100%">
      <Heading as="h2" size="sm" mb={2} textAlign="left">
        {guildType.includes('ally') ? 'Aliados' : 'Inimigos'} - {guildType.includes('Gain') ? 'Ganho' : 'Perda'} de XP
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
            {tableRows}
          </Tbody>
        </Table>
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