'use client'

import { Center, Box, Heading, VStack, Select, Text } from '@chakra-ui/react';
import { ChangeEvent, useState, useCallback } from 'react';
import DashboardLayout from '../../components/dashboard';
import { Worlds } from '../../constant/world';
import { getSoulwarPlayers } from '../../services/guilds';

const Soulwar = () => {
  const [selectedMundo, setSelectedMundo] = useState<string>('');
  const [bonecosSoulwar, setBonecosSoulwar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectChange = useCallback(async (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedWorld = event.target.value;
    setSelectedMundo(selectedWorld);

    if (selectedWorld) {
      setLoading(true);
      setError('');
      try {
        const data = await getSoulwarPlayers(selectedWorld);
        setBonecosSoulwar(data.available_soulwar);
      } catch (error) {
        setError('Failed to load Soulwar data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  }, []);

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
              <Text color="gray.500">Loading...</Text>
            ) : error ? (
              <Text color="red.500">{error}</Text>
            ) : (
              <>
                <Box borderWidth={1} borderRadius="lg" p={4} h="400px" overflowY="auto">
                  <Heading as="h2" size="lg" mb={4}>Personagens que não fizeram Soulwar</Heading>
                  {bonecosSoulwar.length > 0 ? (
                    bonecosSoulwar.map((boneco: any) => (
                      <Box key={boneco.name} p={2} borderBottom="1px" borderColor="gray.200">
                        {boneco.name}
                      </Box>
                    ))
                  ) : (
                    <Text color="gray.500">Sem dados da soulwar</Text>
                  )}
                </Box>
              </>
            )}
          </VStack>
        </Box>
      </Center>
    </DashboardLayout>
  );
};

export default Soulwar;
