'use client'

import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  useToast,
  Container,
  Divider
} from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard';
import { OrangeList } from '../../components/orange-list';


const OrangeListPage: React.FC = () => {
  const [characterName, setCharacterName] = useState('');
  const [showList, setShowList] = useState(false);
  const toast = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (characterName.trim() === '') {
      toast({
        title: 'Erro',
        description: 'Por favor, insira o nome do personagem.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setShowList(true);
  };

  return (
    <DashboardLayout>
      <Container maxW="container.md" py={8}>
        <VStack spacing={6} align="stretch">
          <Heading as="h1" size="xl" textAlign="center">
            Lista de Orange
          </Heading>

          <Box bg="blue.700" p={4} borderRadius="md">
            <Text fontWeight="bold" mb={2}>Instruções:</Text>
            <Text>
              Digite o nome do seu personagem para ver a lista de oranges associados a ele.
              Os oranges são jogadores que podem ser atacados sem penalidades.
            </Text>
            <Text fontSize="xs">• Lembrando que ira retornar tambem os personagens em que voce morreu PK.</Text>
          </Box>

          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <Input
                placeholder="Nome do personagem"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
              />
              <Button type="submit" colorScheme="blue">
                Buscar Oranges
              </Button>
            </VStack>
          </form>

          <Divider />

          {showList && (
            <Box>
              <OrangeList characterName={characterName} />
            </Box>
          )}
        </VStack>
      </Container>
    </DashboardLayout>
  );
};

export default OrangeListPage;