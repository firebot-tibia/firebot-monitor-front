'use client'

import { Center, Box, Heading, VStack, Select, Text, Button, SimpleGrid } from '@chakra-ui/react';
import { ChangeEvent, useState, useCallback } from 'react';
import DashboardLayout from '../../components/dashboard';
import { Worlds } from '../../constant/world';
import { getSoulwarPlayers } from '../../services/guilds';

const Soulwar = () => {
  const [selectedMundo, setSelectedMundo] = useState<string>('');
  const [bonecosSoulwar, setBonecosSoulwar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSelectChange = useCallback(async (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedWorld = event.target.value;
    setSelectedMundo(selectedWorld);

    if (selectedWorld) {
      setLoading(true);
      setError('');
      setCurrentPage(1);
      try {
        const data  = await getSoulwarPlayers(selectedWorld);
        setBonecosSoulwar(data.avaiable_soulwar || []);
      } catch (error) {
        console.log(error)
        setError('Falha ao buscar dados da soulwar');
      } finally {
        setLoading(false);
      }
    }
  }, []);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = bonecosSoulwar.slice(startIndex, endIndex);

  const totalPages = Math.ceil(bonecosSoulwar.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <DashboardLayout>
      <Center p={4}>
        <Box w="full" maxW="600px">
          <Heading as="h1" mb={6} textAlign="center">Lista da Soulwar</Heading>
          <VStack spacing={4} align="stretch">
            <Select placeholder="Selecione o mundo" onChange={handleSelectChange} value={selectedMundo}>
              {Worlds.map(world => (
                <option key={world} value={world}>
                  {world}
                </option>
              ))}
            </Select>
            {loading ? (
              <Text color="gray.500">Carregando...</Text>
            ) : error ? (
              <Text color="red.500">{error}</Text>
            ) : (
              <>
                <Box borderWidth={1} borderRadius="lg" p={4} h="400px" overflowY="auto">
                  <Heading as="h2" size="lg" mb={4}>Personagens que não fizeram Soulwar</Heading>
                  {paginatedItems.length > 0 ? (
                    paginatedItems.map((boneco: any) => (
                      <Box key={boneco.name} p={2} borderBottom="1px" borderColor="gray.200">
                        Character: {boneco.name} - Voc: {boneco.vocation} - Lvl: {boneco.level}
                      </Box>
                    ))
                  ) : (
                    <Text color="gray.500">Sem dados da soulwar</Text>
                  )}
                </Box>
                {bonecosSoulwar.length > itemsPerPage && (
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
          </VStack>
        </Box>
      </Center>
    </DashboardLayout>
  );
};

export default Soulwar;
