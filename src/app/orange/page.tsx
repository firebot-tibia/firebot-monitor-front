'use client';

import React, { useState } from 'react';
import { Box, Button, Input, VStack, Text, Heading } from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard';

const Orange = () => {
  const [characterName, setCharacterName] = useState('');
  const [characterList, setCharacterList] = useState([]);

  const handleSubmit = () => {
    if (characterName.trim() !== '') {
      setCharacterName('');
    }
  };

  return (
    <DashboardLayout>
    <Box p={4} maxW="800px" mx="auto">
      <Heading as="h1" mb={4} textAlign="center">
        Orange List
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
        {characterList.length > 0 ? (
          characterList.map((name, index) => (
            <Box key={index} p={2} borderBottom="1px" borderColor="gray.200">
              {name}
            </Box>
          ))
        ) : (
          <Text color="gray.500">Nenhum personagem adicionado.</Text>
        )}
      </Box>
    </Box>
    </DashboardLayout>
  );
};

export default Orange;
