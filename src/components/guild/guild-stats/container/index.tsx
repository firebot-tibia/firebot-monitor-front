import React, { useCallback, useEffect } from 'react';
import { Box, Flex, SimpleGrid, Text, Tooltip, useDisclosure } from '@chakra-ui/react';
import FilterBar from './filter-bar';
import GuildTable from '../table';
import CharacterTooltip from './character-tooltip';
import { GuildMember } from '../../../../shared/interface/guild/guild-stats.interface';
import { useGuildStatsStore } from '../../../../store/guild-stats-store';
import { Pagination } from '../../../pagination';

const GuildStatsContainer: React.FC = () => {
  const {
    filter,
    vocationFilter,
    nameFilter,
    allyGainData,
    allyLossData,
    enemyGainData,
    enemyLossData,
    allyGainPage,
    allyLossPage,
    enemyGainPage,
    enemyLossPage,
    loading,
    setFilter,
    setVocationFilter,
    setNameFilter,
    setPage,
    setSelectedCharacter,
    fetchGuildStats,
  } = useGuildStatsStore();

  const { onOpen } = useDisclosure();

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

  const handlePageChange = useCallback((guildType: 'allyGain' | 'allyLoss' | 'enemyGain' | 'enemyLoss', pageNumber: number) => {
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
      <SimpleGrid columns={[1, null, 2]} spacing={4} width="100%" mt={4}>
        <Box>
          <SimpleGrid columns={[1, null, 2]} spacing={4}>
            <Box>
              <GuildTable
                guildType="allyGain"
                guildData={allyGainData}
                currentPage={allyGainPage}
                filter={filter}
                onCharacterClick={handleCharacterClick}
                renderCharacterName={renderCharacterName}
                isLoading={loading}
              />
              <Pagination
                currentPage={allyGainPage}
                totalPages={allyGainData.totalPages}
                onPageChange={(page) => handlePageChange('allyGain', page)}
              />
            </Box>
            <Box>
              <GuildTable
                guildType="allyLoss"
                guildData={allyLossData}
                currentPage={allyLossPage}
                filter={filter}
                onCharacterClick={handleCharacterClick}
                renderCharacterName={renderCharacterName}
                isLoading={loading}
              />
              <Pagination
                currentPage={allyLossPage}
                totalPages={allyLossData.totalPages}
                onPageChange={(page) => handlePageChange('allyLoss', page)}
              />
            </Box>
          </SimpleGrid>
        </Box>
        <Box>
          <SimpleGrid columns={[1, null, 2]} spacing={4}>
            <Box>
              <GuildTable
                guildType="enemyGain"
                guildData={enemyGainData}
                currentPage={enemyGainPage}
                filter={filter}
                onCharacterClick={handleCharacterClick}
                renderCharacterName={renderCharacterName}
                isLoading={loading}
              />
              <Pagination
                currentPage={enemyGainPage}
                totalPages={enemyGainData.totalPages}
                onPageChange={(page) => handlePageChange('enemyGain', page)}
              />
            </Box>
            <Box>
              <GuildTable
                guildType="enemyLoss"
                guildData={enemyLossData}
                currentPage={enemyLossPage}
                filter={filter}
                onCharacterClick={handleCharacterClick}
                renderCharacterName={renderCharacterName}
                isLoading={loading}
              />
              <Pagination
                currentPage={enemyLossPage}
                totalPages={enemyLossData.totalPages}
                onPageChange={(page) => handlePageChange('enemyLoss', page)}
              />
            </Box>
          </SimpleGrid>
        </Box>
      </SimpleGrid>
    </Flex>
  );
};

export default React.memo(GuildStatsContainer);