import React, { FC, useState, useEffect } from 'react';
import { Box, Text, VStack, HStack, Spinner } from '@chakra-ui/react';
import { getOrangeList } from '../../../services/guilds';

interface OrangeListProps {
  characterName: string;
}
interface OrangeCharacter {
  Name: string;
  Level: number;
  Vocation: string;
  OnlineStatus: boolean;
}

export const OrangeList: FC<OrangeListProps> = ({ characterName }) => {
  const [orangeList, setOrangeList] = useState<OrangeCharacter[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrangeList = async () => {
      try {
        const data = await getOrangeList(characterName);
        setOrangeList(data || []);
      } catch (error) {
        setError('Falha ao carregar a lista de Orange.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrangeList();
  }, [characterName]);

  if (loading) return <Spinner />;
  if (error) return <Text color="red.500">{error}</Text>;

  return (
    <VStack align="stretch" spacing={2} maxH="400px" overflowY="auto">
      <Text fontWeight="bold">Lista de Oranges</Text>
      {!orangeList || orangeList.length === 0 ? (
        <Text>Nenhum orange encontrado.</Text>
      ) : (
        orangeList.map((orange, index) => (
          <Box key={index} p={2} bg="gray.700" borderRadius="md">
            <Text><strong>Nome:</strong> {orange.Name}</Text>
            <Text><strong>Nível:</strong> {orange.Level}</Text>
            <Text><strong>Vocação:</strong> {orange.Vocation}</Text>
            <HStack>
              <Text><strong>Status:</strong></Text>
              <Box
                as="span"
                width="10px"
                height="10px"
                borderRadius="50%"
                bg={orange.OnlineStatus ? 'green.500' : 'red.500'}
              />
              <Text>{orange.OnlineStatus ? 'Online' : 'Offline'}</Text>
            </HStack>
          </Box>
        ))
      )}
    </VStack>
  );
};