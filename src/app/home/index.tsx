'use client';

import { Box, Heading, Spinner, Grid, GridItem, Container, Input, Card, CardBody, useToast } from '@chakra-ui/react';
import { useEffect, useState, useMemo, FC, useCallback } from 'react';
import { io } from 'socket.io-client';
import { throttle } from 'lodash';
import { CharacterType } from '../../shared/enum/character-type.enum';
import { CharacterRespawnDTO } from '../../shared/interface/character-list.interface';
import Navbar from '../../components/navbar';
import { TableWidget } from '../../components/table';

const Home: FC = () => {
  const [characterData, setCharacterData] = useState<CharacterRespawnDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

  const columns = useMemo(() => ['Voc', 'Nome', 'Lvl', 'Ultimo Exiva', 'PT'], []);

  useEffect(() => {
    const socket = io(socketUrl);

    const throttledSetCharacterData = throttle((data: CharacterRespawnDTO[]) => {
      setCharacterData(data);
      setIsLoading(false);
    }, 1000);

    socket.on('characterListData', (data: CharacterRespawnDTO[]) => {
      if (data) {
        throttledSetCharacterData(data);
      } else {
        toast({
          title: 'Erro ao carregar dados.',
          description: 'Não foi possível carregar os dados da guilda.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setIsLoading(false);
      }
    });

    socket.emit('requestCharacterListData');

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socket.on('reconnect_attempt', () => {
      console.log('Attempting to reconnect...');
    });

    return () => {
      socket.disconnect();
    };
  }, [toast, socketUrl]);

  const filteredCharacterData = useMemo(() => {
    if (!searchTerm) return characterData;
    return characterData.filter((item) =>
      item.character.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, characterData]);

  const filterCharactersByType = useCallback((type: CharacterType) => {
    return filteredCharacterData.filter((item) => item.character.type === type);
  }, [filteredCharacterData]);

  return (
    <div>
      <Navbar />
      <Container className="p-4" maxW="full" display="flex" flexDirection="column" gap="4">
        <Card bg="rgba(255, 255, 255, 0.2)" backdropFilter="blur(10px)">
          <CardBody>
            <Box display="flex" gap="2" justifyContent="space-between" mb="4">
              <Input
                maxW="320px"
                placeholder="Buscar membro"
                size="md"
                rounded="xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="rgba(255, 255, 255, 0.2)"
                color="white"
                _placeholder={{ color: 'gray.300' }}
                backdropFilter="blur(10px)"
              />
            </Box>
            {isLoading ? (
              <Spinner size="xl" />
            ) : (
              <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap="7">
                <GridItem>
                  <Heading color="white" as="h2" size="lg" mt="4">
                    Makers
                  </Heading>
                  <TableWidget
                    columns={columns}
                    data={filterCharactersByType(CharacterType.MAKER)}
                    isLoading={isLoading}
                  />
                </GridItem>
                <GridItem>
                  <Heading color="white" as="h2" size="lg" mt="4">
                    Mains
                  </Heading>
                  <TableWidget
                    columns={columns}
                    data={filterCharactersByType(CharacterType.MAIN)}
                    isLoading={isLoading}
                  />
                </GridItem>
                <GridItem>
                  <Heading color="white" as="h2" size="lg" mt="4">
                    Bombas
                  </Heading>
                  <TableWidget
                    columns={columns}
                    data={filterCharactersByType(CharacterType.BOMBA)}
                    isLoading={isLoading}
                  />
                </GridItem>
              </Grid>
            )}
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default Home;
