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
} from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard';

interface GuildMemberResponse {
  rank: number;
  vocation: string;
  name: string;
  level: number;
  dailyExp: number;
  timeOnline: string;
  status: boolean;
}

interface GuildStatsResponse {
  ally: GuildMemberResponse[];
  enemy: GuildMemberResponse[];
}

const fetchGuildStats = async (guildType: 'ally' | 'enemy', filter: string, nameFilter: string): Promise<GuildMemberResponse[]> => {
  const response: GuildStatsResponse = {
    ally: [
      { rank: 1, vocation: 'EK', name: 'Maarculino', level: 531, dailyExp: 60619094, timeOnline: '15:15', status: true },
      { rank: 2, vocation: 'ED', name: 'Zezinho', level: 528, dailyExp: 47739010, timeOnline: '7:30', status: false },
    ],
    enemy: [
      { rank: 1, vocation: 'MS', name: 'Tank Crusher', level: 532, dailyExp: 53633991, timeOnline: '5:45', status: true },
      { rank: 2, vocation: 'RP', name: 'Wallace Novaera', level: 539, dailyExp: 49821389, timeOnline: '7:45', status: false },
    ]
  };

  return response[guildType];
};

const GuildStats = () => {
  const [guildType, setGuildType] = useState<'ally' | 'enemy'>('ally');
  const [filter, setFilter] = useState('Diaria');
  const [nameFilter, setNameFilter] = useState('');
  const [guildData, setGuildData] = useState<GuildMemberResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchGuildStats(guildType, filter, nameFilter);
      setGuildData(data);
    };

    fetchData();
  }, [guildType, filter, nameFilter]);

  const handleGuildTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGuildType(e.target.value as 'ally' | 'enemy');
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
  };

  const handleNameFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameFilter(e.target.value);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = guildData.slice(startIndex, endIndex);

  const totalPages = Math.ceil(guildData.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <DashboardLayout>
      <Box p={4}>
        <Heading as="h1" mb={6} textAlign="center">Estatísticas da Guilda</Heading>
        <SimpleGrid columns={3} spacing={4} mb={4}>
          <Select value={guildType} onChange={handleGuildTypeChange}>
            <option value="ally">Guild aliada</option>
            <option value="enemy">Guild Inimiga</option>
          </Select>
          <Select value={filter} onChange={handleFilterChange}>
            <option value="Diaria">Diária</option>
            <option value="Semanal">Semanal</option>
            <option value="Mensal">Mensal</option>
          </Select>
          <input
            type="text"
            placeholder="Buscar pelo nome do personagem"
            value={nameFilter}
            onChange={handleNameFilterChange}
          />
        </SimpleGrid>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>#</Th>
              <Th>Voc</Th>
              <Th>Nome</Th>
              <Th>Lvl</Th>
              <Th>Exp</Th>
              <Th>Tempo</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginatedItems.map((item, index) => (
              <Tr key={index}>
                <Td>{item.rank}</Td>
                <Td>{item.vocation}</Td>
                <Td>{item.name}</Td>
                <Td>{item.level}</Td>
                <Td>{item.dailyExp.toLocaleString()}</Td>
                <Td>{item.timeOnline}</Td>
                <Td>
                    <Box
                    as="span"
                    display="inline-block"
                    w={3}
                    h={3}
                    borderRadius="full"
                    bg={item.status ? 'green.500' : 'red.500'}
                    />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {guildData.length > itemsPerPage && (
          <SimpleGrid columns={3} spacing={4} mt={4}>
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              isDisabled={currentPage === 1}
            >
              Previous
            </Button>
            <Text textAlign="center" lineHeight="40px">
              Page {currentPage} of {totalPages}
            </Text>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              isDisabled={currentPage === totalPages}
            >
              Next
            </Button>
          </SimpleGrid>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default GuildStats;
