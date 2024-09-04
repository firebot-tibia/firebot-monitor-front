'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Box,
  Button,
  SimpleGrid,
  Heading,
  Text,
  Image,
  Spinner,
} from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard';
import { getExperienceList } from '../../services/guilds';
import { Vocations } from '../../constant/character';

interface GuildMemberResponse {
  experience: string;
  vocation: string;
  name: string;
  level: number;
  online: boolean;
}

const GuildStats = () => {
  const [guildType, setGuildType] = useState<'ally' | 'enemy'>('ally');
  const [filter, setFilter] = useState('Diaria');
  const [vocationFilter, setVocationFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [guildData, setGuildData] = useState<GuildMemberResponse[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [noDataFound, setNoDataFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  const fetchGuildStats = async () => {
    try {
      setLoading(true);
      const query = {
        kind: guildType,
        vocation: vocationFilter,
        name: nameFilter,
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

      if (formattedData.length === 0) {
        setNoDataFound(true);
      } else {
        setGuildData(formattedData);
        setTotalRecords(response.exp_list.Count.records);
        setTotalPages(response.exp_list.Count.pages);
        setNoDataFound(false);
      }
    } catch (error) {
      console.error('Failed to fetch guild stats:', error);
      setNoDataFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuildStats();
  }, [guildType, filter, vocationFilter, nameFilter, currentPage]);

  const handleGuildTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGuildType(e.target.value as 'ally' | 'enemy');
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
  };

  const handleVocationFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVocationFilter(e.target.value);
  };

  const handleNameFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameFilter(e.target.value);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <DashboardLayout>
      <Box p={4}>
        <Heading as="h1" mb={6} textAlign="center">Estatísticas da Guilda</Heading>
        <SimpleGrid columns={4} spacing={4} mb={4}>
          <Select value={guildType} onChange={handleGuildTypeChange}>
            <option value="ally">Guild aliada</option>
            <option value="enemy">Guild Inimiga</option>
          </Select>
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
          <input
            type="text"
            placeholder="Buscar pelo nome do personagem"
            value={nameFilter}
            onChange={handleNameFilterChange}
          />
        </SimpleGrid>

        {loading ? (
          <Box textAlign="center" mt={4}>
            <Spinner size="xl" />
            <Text>Carregando...</Text>
          </Box>
        ) : noDataFound ? (
          <Text textAlign="center" mt={4} color="red.500">Nenhum dado encontrado.</Text>
        ) : (
          <>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Exp</Th>
                  <Th>Voc</Th>
                  <Th>Nome</Th>
                  <Th>Lvl</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {guildData.map((item, index) => (
                  <Tr key={index}>
                    <Td>{item.experience}</Td>
                    <Td>
                      <Image src={Vocations[item.vocation]} alt={item.vocation} boxSize="24px" />
                    </Td>
                    <Td>{item.name}</Td>
                    <Td>{item.level}</Td>
                    <Td>
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

            {totalRecords > itemsPerPage && (
              <SimpleGrid columns={3} spacing={4} mt={4}>
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  isDisabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <Text textAlign="center" lineHeight="40px">
                Página {currentPage} de {totalPages}
                </Text>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  isDisabled={currentPage === totalPages}
                >
                  Próximo
                </Button>
              </SimpleGrid>
            )}
          </>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default GuildStats;
