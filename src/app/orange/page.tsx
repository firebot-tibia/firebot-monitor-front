'use client';

import React, { useState } from 'react';
import { Box, Button, Input, VStack, Text, Heading, HStack } from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard';
import { getOrangeList } from '../../services/guilds';
import { useToastContext } from '../../context/toast/toast-context';

const Orange = () => {
  const [characterName, setCharacterName] = useState('');
  const [characterList, setCharacterList] = useState<
    { Name: string; Level: number; Vocation: string; OnlineStatus: boolean }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToastContext();

  const handleSubmit = async () => {
    if (characterName.trim() === '') {
      setError('Nome do personagem necessário');
      showToast({
        title: 'Nome do personagem necessário.',
        description: 'Por favor, insira o nome do personagem.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await getOrangeList(characterName.trim());
      setCharacterList(data);
      showToast({
        title: 'Sucesso!',
        description: `Lista de Orange para ${characterName} carregada.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      setError('Failed to fetch the orange list. Please try again.');
      showToast({
        title: 'Erro ao carregar lista.',
        description: 'Falha ao carregar a lista de Orange. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setCharacterName('');
    }
  };

  return (
    <DashboardLayout>
      <Box p={4} maxW="800px" mx="auto">
        <Heading as="h1" mb={4} textAlign="center">
          Lista de Oranges
        </Heading>
        <VStack spacing={4} mb={8} align="start">
          <Box w="full">
            <Text mb={1}>Nome do personagem</Text>
            <Input
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="Digite o nome do personagem"
              size="md"
            />
          </Box>
          <Button onClick={handleSubmit} colorScheme="teal" alignSelf="flex-start">
            Enviar
          </Button>
        </VStack>
        <Box borderWidth={1} borderRadius="lg" p={4} h="400px" overflowY="auto">
          <Text mb={2}>Lista com todos os bonecos oranges</Text>
          {loading ? (
            <Text color="gray.500">Loading...</Text>
          ) : error ? (
            <Text color="red.500">{error}</Text>
          ) : characterList?.length > 0 ? (
            characterList.map((character, index) => (
              <Box key={index} p={2} borderBottom="1px" borderColor="gray.200">
                <Text><strong>Nome:</strong> {character.Name}</Text>
                <Text><strong>Nível:</strong> {character.Level}</Text>
                <Text><strong>Vocação:</strong> {character.Vocation}</Text>
                <HStack>
                  <Text><strong>Status:</strong></Text>
                  <Box
                    as="span"
                    width="10px"
                    height="10px"
                    borderRadius="50%"
                    bg={character.OnlineStatus ? 'green.500' : 'red.500'}
                  />
                  <Text>{character.OnlineStatus ? 'Online' : 'Offline'}</Text>
                </HStack>
              </Box>
            ))
          ) : (
            <Text color="gray.500">Nenhum orange encontrado.</Text>
          )}
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Orange;
