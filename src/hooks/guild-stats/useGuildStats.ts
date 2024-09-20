import { useState, useEffect } from 'react';
import { useDisclosure } from '@chakra-ui/react';
import { getExperienceList } from '../../services/guilds';
import { GuildData } from '../../shared/interface/guild-stats.interface';

const useGuildStats = () => {
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const [allyData, enemyData] = await Promise.all([
        fetchGuildStats('ally', allyCurrentPage),
        fetchGuildStats('enemy', enemyCurrentPage)
      ]);
      setAllyGuildData(allyData);
      setEnemyGuildData(enemyData);
    };

    fetchData();
  }, [filter, vocationFilter, nameFilter, sort, allyCurrentPage, enemyCurrentPage]);

  const handleFilterChange = (selectedFilter: string) => {
    setFilter(selectedFilter);
    const newSort = selectedFilter === 'Diaria' ? 'exp_yesterday' : 
                    selectedFilter === 'Semanal' ? 'exp_week' : 'exp_month';
    setSort(newSort);
    setAllyCurrentPage(1);
    setEnemyCurrentPage(1);
  };

  const handleVocationFilterChange = (selectedVocation: string) => {
    setVocationFilter(selectedVocation);
    setAllyCurrentPage(1);
    setEnemyCurrentPage(1);
  };

  const handleNameFilterChange = (name: string) => {
    setNameFilter(name.trim());
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

  return {
    filter,
    vocationFilter,
    nameFilter,
    allyGuildData,
    enemyGuildData,
    allyCurrentPage,
    enemyCurrentPage,
    loading,
    selectedCharacter,
    isOpen,
    onOpen,
    onClose,
    handleFilterChange,
    handleVocationFilterChange,
    handleNameFilterChange,
    handlePageChange,
    handleCharacterClick,
  };
};

export default useGuildStats;