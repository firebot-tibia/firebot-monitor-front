'use client';

import { Box, Heading, Spinner, Grid, GridItem, Container, Input, Card, CardBody } from '@chakra-ui/react';
import { useEffect, useState, useMemo, FC } from 'react';
import { io } from 'socket.io-client';
import { CharacterType } from '../../shared/enum/character-type.enum';
import { CharacterRespawnDTO } from '../../shared/interface/character-list.interface';
import Navbar from '../../components/navbar';
import { TableWidget } from '../../components/table';

const Home: FC = () => {
  const [characterData, setCharacterData] = useState<CharacterRespawnDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const columns = useMemo(() => ['Voc', 'Nome', 'Lvl', 'Ultimo Exiva', 'PT'], []);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');

    socket.on('characterListData', (data: CharacterRespawnDTO[]) => {
      setCharacterData(data);
      setIsLoading(false);
    });

    socket.emit('requestCharacterListData');

    return () => {
      socket.disconnect();
    };
  }, []);

  const filterCharactersByType = (type: CharacterType) => {
    return characterData.filter(item => item.character.type === type);
  };

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
