import React, { useCallback, useEffect } from 'react';
import { Box, Flex, Spinner, Text, Tooltip, useDisclosure } from '@chakra-ui/react';
import FilterBar from '../filter-bar';
import GuildTable from '../table';
import CharacterTooltip from './character-tooltip';
import { GuildMember } from '../../../../shared/interface/guild/guild-stats.interface';
import { useGuildStatsStore } from '../../../../store/guild-stats-store';

const GuildStatsContainer: React.FC = () => {
  const {
    filter,
    vocationFilter,
    nameFilter,
    allyGuildData,
    enemyGuildData,
    allyCurrentPage,
    enemyCurrentPage,
    loading,
    setFilter,
    setVocationFilter,
    setNameFilter,
    setPage,
    setSelectedCharacter,
    fetchGuildStats,
  } = useGuildStatsStore();

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchGuildStats('ally');
    fetchGuildStats('enemy');
  }, [fetchGuildStats]);

  const handleFilterChange = useCallback((selectedFilter: string) => {
    setFilter(selectedFilter);
  }, [setFilter]);

  const handleVocationFilterChange = useCallback((selectedVocation: string) => {
    setVocationFilter(selectedVocation);
  }, [setVocationFilter]);

  const handleNameFilterChange = useCallback((name: string) => {
    setNameFilter(name);
  }, [setNameFilter]);

  const handlePageChange = useCallback((guildType: 'ally' | 'enemy', pageNumber: number) => {
    setPage(guildType, pageNumber);
  }, [setPage]);

  const handleCharacterClick = useCallback((characterName: string) => {
    setSelectedCharacter(characterName);
    onOpen();
  }, [setSelectedCharacter, onOpen]);

  const renderCharacterName = useCallback((character: GuildMember) => (
    <Tooltip 
      label={
        <CharacterTooltip 
          name={character.name}
          vocation={character.vocation}
          level={character.level}
          experience={character.experience}
          online={character.online}
        />
      }
      placement="top"
      hasArrow
    >
      <Text 
        cursor="pointer" 
        onClick={() => handleCharacterClick(character.name)}
        _hover={{ textDecoration: 'underline' }}
      >
        {character.name}
      </Text>
    </Tooltip>
  ), [handleCharacterClick]);

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Box textAlign="center">
          <Spinner size="xl" />
          <Text mt={4}>Carregando...</Text>
        </Box>
      </Flex>
    );
  }

  return (
    <Flex direction="column" align="center" width="100%" maxWidth="1400px" mx="auto">
      <FilterBar
        filter={filter}
        vocationFilter={vocationFilter}
        nameFilter={nameFilter}
        onFilterChange={handleFilterChange}
        onVocationFilterChange={handleVocationFilterChange}
        onNameFilterChange={handleNameFilterChange}
      />
      <Flex justify="center" wrap="wrap" mt={4} width="100%">
        <Box width={['100%', '100%', '48%']} mx={2} mb={4}>
          <GuildTable
            guildType="ally"
            guildData={allyGuildData}
            currentPage={allyCurrentPage}
            filter={filter}
            onPageChange={(page) => handlePageChange('ally', page)}
            onCharacterClick={handleCharacterClick}
            renderCharacterName={renderCharacterName}
          />
        </Box>
        <Box width={['100%', '100%', '48%']} mx={2} mb={4}>
          <GuildTable
            guildType="enemy"
            guildData={enemyGuildData}
            currentPage={enemyCurrentPage}
            filter={filter}
            onPageChange={(page) => handlePageChange('enemy', page)}
            onCharacterClick={handleCharacterClick}
            renderCharacterName={renderCharacterName}
          />
        </Box>
      </Flex>
    </Flex>
  );
};

export default React.memo(GuildStatsContainer);