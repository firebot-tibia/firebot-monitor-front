'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Box,
  SimpleGrid,
  Heading,
  Text,
  Image,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
  Input,
  useDisclosure,
  VStack,
  Flex,
} from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard';
import { getExperienceList } from '../../services/guilds';
import { Vocations } from '../../constant/character';
import { Pagination } from '../../components/pagination';
import PlayerModal from '../../components/guild-stats/player-modal';

interface GuildMemberResponse {
  experience: string;
  vocation: string;
  name: string;
  level: number;
  online: boolean;
}

interface GuildData {
  data: GuildMemberResponse[];
  totalPages: number;
  totalExp: number;
  avgExp: number;
}

const GuildStats: React.FC = () => {
  const [filter, setFilter] = useState('Diaria');
  const [sort, setSort] = useState('exp_yesterday');
  const [vocationFilter, setVocationFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [allyGuildData, setAllyGuildData] = useState<GuildData>({ data: [], totalPages: 1, totalExp: 0, avgExp: 0 });
  const [enemyGuildData, setEnemyGuildData] = useState<GuildData>({ data: [], totalPages: 1, totalExp: 0, avgExp: 0 });
  const [allyCurrentPage, setAllyCurrentPage] = useState(1);
  const [enemyCurrentPage, setEnemyCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const itemsPerPage = 30;

  const fetchGuildStats = async (guildType: 'ally' | 'enemy', currentPage: number) => {
    try {
      setLoading(true);
      const query = {
        kind: guildType,
        vocation: vocationFilter,
        name: nameFilter,
        sort: sort,
        offset: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      };

      const response = await getExperienceList(query);

      const experienceField =
        filter === 'Diaria' ? 'experience_one_day' :
        filter === 'Semanal' ? 'experience_one_week' : 'experience_one_month';

      const formattedData = response.exp_list.players.map((player: any) => ({
        experience: player[experienceField],
        vocation: player.vocation,
        name: player.name,
        level: player.level,
        online: player.online,
      }));

      const totalExp = filter === 'Diaria' ? response.exp_list.total_exp_yesterday :
                       filter === 'Semanal' ? response.exp_list.total_exp_7_days : response.exp_list.total_exp_30_days;
      
      const avgExp = filter === 'Diaria' ? response.exp_list.medium_exp_yesterday :
                     filter === 'Semanal' ? response.exp_list.medium_exp_7_days : response.exp_list.medium_exp_30_days;

      return {
        data: formattedData,
        totalPages: Math.ceil(response.exp_list.Count.records / itemsPerPage),
        totalExp,
        avgExp,
      };
    } catch (error) {
      console.error(`Failed to fetch ${guildType} guild stats:`, error);
      return { data: [], totalPages: 1, totalExp: 0, avgExp: 0 };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [allyData, enemyData] = await Promise.all([
        fetchGuildStats('ally', allyCurrentPage),
        fetchGuildStats('enemy', enemyCurrentPage)
      ]);
      setAllyGuildData(allyData);
      setEnemyGuildData(enemyData);
      setLoading(false);
    };

    fetchData();
  }, [filter, vocationFilter, nameFilter, sort, allyCurrentPage, enemyCurrentPage]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFilter = e.target.value;
    setFilter(selectedFilter);
    const newSort = selectedFilter === 'Diaria' ? 'exp_yesterday' : 
                    selectedFilter === 'Semanal' ? 'exp_week' : 'exp_month';
    setSort(newSort);
    setAllyCurrentPage(1);
    setEnemyCurrentPage(1);
  };

  const handleVocationFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVocationFilter(e.target.value);
    setAllyCurrentPage(1);
    setEnemyCurrentPage(1);
  };

  const handleNameFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameFilter(e.target.value.trim());
    setAllyCurrentPage(1);
    setEnemyCurrentPage(1);
  };

  const handlePageChange = (guildType: 'ally' | 'enemy', pageNumber: number) => {
    if (guildType === 'ally') {
      setAllyCurrentPage(pageNumber);
    } else {
      setEnemyCurrentPage(pageNumber);
    }
  };

  const handleCharacterClick = (characterName: string) => {
    setSelectedCharacter(characterName);
    onOpen();
  };

  const renderGuildTable = (guildType: 'ally' | 'enemy', guildData: GuildData, currentPage: number) => (
    <Box>
      <Heading as="h2" size="md" mb={2}>{guildType === 'ally' ? 'Aliados' : 'Inimigos'}</Heading>
      <StatGroup mb={4}>
        <Stat>
          <StatLabel>Experiência Total</StatLabel>
          <StatNumber>{guildData.totalExp.toLocaleString('pt-BR')}</StatNumber>
          <StatHelpText>{filter}</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Experiência Média</StatLabel>
          <StatNumber>{guildData.avgExp.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</StatNumber>
          <StatHelpText>{filter}</StatHelpText>
        </Stat>
      </StatGroup>
      <VStack spacing={0} align="stretch" style={{ transform: 'scale(0.9)', transformOrigin: 'top left', width: '100%' }}>
        <Table variant="simple" size="sm" style={{ borderCollapse: 'collapse' }}>
          <Thead>
            <Tr>
              <Th p={1} textAlign="left">EXP</Th>
              <Th p={1} textAlign="center">VOC</Th>
              <Th p={1} textAlign="left">NOME</Th>
              <Th p={1} textAlign="right">LVL</Th>
              <Th p={1} textAlign="center">STATUS</Th>
            </Tr>
          </Thead>
          <Tbody>
            {guildData.data.map((item, index) => (
              <Tr key={index} onClick={() => handleCharacterClick(item.name)} _hover={{ bg: 'gray.600', cursor: 'pointer' }}>
                <Td p={1} textAlign="left">{item.experience}</Td>
                <Td p={1} textAlign="center">
                  <Image src={Vocations[item.vocation]} alt={item.vocation} boxSize="24px" display="inline-block" />
                </Td>
                <Td p={1} textAlign="left">{item.name}</Td>
                <Td p={1} textAlign="right">{item.level}</Td>
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
      </VStack>
      <Pagination
        currentPage={currentPage}
        totalPages={guildData.totalPages}
        onPageChange={(page) => handlePageChange(guildType, page)}
      />
    </Box>
  );

  return (
    <DashboardLayout>
      <Box p={4}>
        <Heading as="h1" mb={6} textAlign="center">Estatísticas da Guilda</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
          <Select value={filter} onChange={handleFilterChange}>
            <option value="Diaria">Diária</option>
            <option value="Semanal">Semanal</option>
            <option value="Mensal">Mensal</option>
          </Select>
          <Select value={vocationFilter} onChange={handleVocationFilterChange}>
            <option value="">Todas as vocações</option>
            {Object.keys(Vocations).map((vocation) => (
              <option key={vocation} value={vocation}>
                {vocation}
              </option>
            ))}
          </Select>
          <Input
            placeholder="Buscar personagem por nome"
            value={nameFilter}
            onChange={handleNameFilterChange}
          />
        </SimpleGrid>

        {loading ? (
          <Box textAlign="center" mt={4}>
            <Spinner size="xl" />
            <Text>Carregando...</Text>
          </Box>
        ) : (
          <Flex justify="center" align="flex-start" wrap="wrap" gap={4}>
            {renderGuildTable('ally', allyGuildData, allyCurrentPage)}
            {renderGuildTable('enemy', enemyGuildData, enemyCurrentPage)}
          </Flex>
        )}
      </Box>

      <PlayerModal
        isOpen={isOpen}
        onClose={onClose}
        characterName={selectedCharacter}
      />
    </DashboardLayout>
  );
};

export default GuildStats;