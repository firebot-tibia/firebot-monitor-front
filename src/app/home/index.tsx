'use client';

import {
  Box,
  Heading,
  useToast,
  Spinner,
  Grid,
  GridItem,
  Container,
  Input,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { useEffect, useState, useMemo, FC } from 'react';
import Navbar from '../../components/navbar';
import { CharacterType } from '../../shared/enum/character-type.enum';
import { CharacterListDTO } from '../../dtos/character-list.dto';
import { TableWidget } from '../../components/table';
import { getCharacter } from '../../services/character';
import { getRespawn } from '../../services/respawn';



const Home: FC = () => {
  const [characterData, setCharacterData] = useState<CharacterListDTO[]>([]);
  const [respawnData, setRespawnData] = useState<{ [key: string]: string }>({});
  const [iconState, setIconState] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const toast = useToast();
  const columns = useMemo(() => ['Voc', 'Nome', 'Lvl', 'Ultimo Exiva', 'PT'], []);

  const fetchData = async () => {
    try {
      const characterResponse = await getCharacter();
      const respawnResponse = await getRespawn();

      const characters = characterResponse.data;
      const respawnDataFromApi = respawnResponse.data.reduce((acc: any, item: any) => {
        acc[item.character] = item.character;
        return acc;
      }, {});
      const iconStateFromApi = respawnResponse.data.reduce((acc: any, item: any) => {
        acc[item.character] = item.is_pt ? 'true.png' : 'false.png';
        return acc;
      }, {});

      setCharacterData(characters);
      setRespawnData(respawnDataFromApi);
      setIconState(iconStateFromApi);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      toast({
        title: 'Erro ao buscar dados.',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filterCharactersByType = (type: CharacterType) => {
    return characterData.filter(character => character.type === type);
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
                  respawnData={respawnData}
                  iconState={iconState}
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
                  respawnData={respawnData}
                  iconState={iconState}
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
                  respawnData={respawnData}
                  iconState={iconState}
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
