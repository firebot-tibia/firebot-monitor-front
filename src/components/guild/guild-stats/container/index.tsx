import React from 'react';
import { Box, Flex, Spinner, Text, Tooltip } from '@chakra-ui/react';
import FilterBar from '../filter-bar';
import GuildTable from '../table';
import useGuildStats from '../../../../hooks/guild-stats/useGuildStats';
import CharacterTooltip from './character-tooltip';
import { GuildMember } from '../../../../shared/interface/guild-stats.interface';

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
    handleFilterChange,
    handleVocationFilterChange,
    handleNameFilterChange,
    handlePageChange,
    handleCharacterClick,
  } = useGuildStats();

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

  const renderCharacterName = (character: GuildMember) => (
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
  );


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

export default GuildStatsContainer;