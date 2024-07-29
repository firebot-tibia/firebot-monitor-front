'use client';

import { Heading, Spinner, Grid, GridItem, Container, Card, CardBody, useToast } from '@chakra-ui/react';
import { useEffect, useState, useMemo, FC, useCallback } from 'react';
import { io } from 'socket.io-client';
import { throttle } from 'lodash';
import { CharacterRespawnDTO } from '../../shared/interface/character-list.interface';
import Navbar from '../../components/navbar';
import { TableWidget } from '../../components/table';
import { CharacterType } from '../../shared/enum/character-type.enum';

const Home: FC = () => {
  const [characterData, setCharacterData] = useState<CharacterRespawnDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

  const columns = useMemo(() => ['Voc', 'Nome', 'Lvl', 'Tempo', 'Ultimo Exiva', 'PT'], []);

  useEffect(() => {
    const socket = io(socketUrl);

    const throttledSetCharacterData = throttle((data: CharacterRespawnDTO[]) => {
      setCharacterData(data);
      setIsLoading(false);
    }, 3000);

    socket.on('characterData', (data: CharacterRespawnDTO[]) => {
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

    socket.emit('requestCharacterData');

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


  const filterCharactersByType = useCallback((type: CharacterType) => {
    return characterData.filter((item) => item.character.type === type);
  }, [characterData]);

  return (
    <div>
      <Navbar />
      <Container className="p-8" maxW="full" display="flex" flexDirection="column" gap="7">
        <Card bg="rgba(255, 255, 255, 0.2)" backdropFilter="blur(10px)">
          <CardBody>
            {isLoading ? (
              <Spinner size="xl" />
            ) : (
              <Grid templateColumns="repeat(auto-fit, minmax(800px, 1fr))" gap="7">
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
                    FRACOKS
                  </Heading>
                  <TableWidget
                    columns={columns}
                    data={filterCharactersByType(CharacterType.FRACOKS)}
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
