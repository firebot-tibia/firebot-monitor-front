'use client';

import React, { useState } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, Box, Text, Button } from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard';
import { Death } from '../../shared/interface/death-list.interface';

interface DeathDetailProps {
  death: Death;
}

const mockData = [
  { id: 1, name: 'Zezinho Lojinha Infinita', level: 463, vocation: 'Knight', city: 'Thais', death: 'Died to a Dragon' },
  { id: 2, name: 'Macamagon Wallculino', level: 460, vocation: 'Paladin', city: 'Venore', death: 'Died to a Giant Spider' },
  { id: 3, name: 'Veh Na Missao', level: 432, vocation: 'Sorcerer', city: 'Carlin', death: 'Died to a Demon' },
  { id: 4, name: 'Ren Mendo', level: 358, vocation: 'Druid', city: 'Edron', death: 'Died to a Hydra' },
  { id: 5, name: 'Kina Frontlione', level: 357, vocation: 'Knight', city: 'Darashia', death: 'Died to a Dragon Lord' },
  { id: 6, name: 'Tom Unebra', level: 345, vocation: 'Knight', city: 'Ab\'dendriel', death: 'Died to a Dragon Lord' },
  { id: 7, name: 'Nasty Odeio Pobres', level: 316, vocation: 'Sorcerer', city: 'Thais', death: 'Died to a Giant Spider' },
  { id: 8, name: 'Zezinho Beijoqueiro', level: 479, vocation: 'Knight', city: 'Liberty Bay', death: 'Died to a Dragon Lord' },
  { id: 9, name: 'Nelzerah Casca Debala', level: 455, vocation: 'Knight', city: 'Yalahar', death: 'Died to a Hydra' },
  { id: 10, name: 'Mrgreeen on unebra', level: 433, vocation: 'Knight', city: 'Yalahar', death: 'Died to a Hydra' },
  { id: 11, name: 'Ungle Errepe', level: 389, vocation: 'Knight', city: 'Edron', death: 'Died to a Dragon Lord' },
  { id: 12, name: 'Junior Godlike', level: 366, vocation: 'Knight', city: 'Edron', death: 'Died to a Dragon Lord' },
  { id: 13, name: 'Royal Moonster', level: 345, vocation: 'Knight', city: 'Liberty Bay', death: 'Died to a Dragon Lord' },
  { id: 14, name: 'Lcofzin', level: 343, vocation: 'Knight', city: 'Liberty Bay', death: 'Died to a Dragon Lord' },
];

const itemsPerPage = 5;

const DeathTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDeath, setSelectedDeath] = useState(mockData[0]);

  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentData = mockData.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(mockData.length / itemsPerPage);

  const handleClick = (death: Death ) => {
    setSelectedDeath(death);
  };

  return (
    <DashboardLayout>
    <Box p={4}>
      <Text fontSize="2xl" mb={4} textAlign="center">Recent Deaths</Text>
      <Box overflowX="auto">
        <Table variant="simple" colorScheme="gray">
          <Thead>
            <Tr>
              <Th>Character</Th>
              <Th>Level</Th>
              <Th>Vocation</Th>
              <Th>City</Th>
              <Th>Death</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentData.map((death) => (
              <Tr key={death.id} onClick={() => handleClick(death)} _hover={{ bg: 'gray.600', cursor: 'pointer' }}>
                <Td>{death.name}</Td>
                <Td>{death.level}</Td>
                <Td>{death.vocation}</Td>
                <Td>{death.city}</Td>
                <Td>{death.death}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={4}>
        <Button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>Previous</Button>
        <Text>Page {currentPage} of {totalPages}</Text>
        <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)}>Next</Button>
      </Box>
      <DeathDetail death={selectedDeath} />
    </Box>
    </DashboardLayout>
  );
};

const DeathDetail: React.FC<DeathDetailProps> = ({ death }) => (
  <Box mt={6} p={4} borderWidth="1px" borderRadius="lg" overflow="hidden" bg="gray.700">
    <Text fontSize="xl" fontWeight="bold">Last Death Details</Text>
    <Text><strong>Character:</strong> {death.name}</Text>
    <Text><strong>Level:</strong> {death.level}</Text>
    <Text><strong>Vocation:</strong> {death.vocation}</Text>
    <Text><strong>City:</strong> {death.city}</Text>
    <Text><strong>Death:</strong> {death.death}</Text>
  </Box>
);

export default DeathTable;
