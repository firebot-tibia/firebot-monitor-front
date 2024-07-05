'use client';

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Grid,
  GridItem,
  Heading,
  Input,
  useToast,
} from '@chakra-ui/react';
import { FC, useEffect, useMemo, useState } from 'react';
import { GuildDTO } from '../../dtos/guild.dto';
import { TableWidget } from '../../components/table-old';
import { getEnemyGuild, getRespawn } from '../../services/dashboard';


const HomePage: FC = () => {
  const [guildMembers, setGuildMembers] = useState<GuildDTO | null>(null);
  const [totalOnline, setTotalOnline] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [respawnData, setRespawnData] = useState<{ [key: string]: string }>({});
  const [iconState, setIconState] = useState<{ [key: string]: string }>({});

  const toast = useToast();
  const columns = useMemo(() => ['Voc', 'Nome', 'Lvl', 'Ultimo Exiva', 'PT'], []);

  const fetchGuildData = async () => {
    try {
      const response = await getEnemyGuild();
      const members = response.data.guild.members;
      setGuildMembers(response.data.guild);
      setTotalOnline(response.data.guild.total_online);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      toast({
        title: 'Erro ao buscar dados da guilda.',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const fetchStoredData = async () => {
    try {
      const response = await getRespawn();
      const respawnDataFromApi = response.data.reduce((acc: any, item: any) => {
        acc[item.character] = item.character;
        return acc;
      }, {});
      setRespawnData(respawnDataFromApi);

      const iconStateFromApi = response.data.reduce((acc: any, item: any) => {
        acc[item.character] = item.is_pt ? 'true.png' : 'false.png';
        return acc;
      }, {});
      setIconState(iconStateFromApi);
    } catch (error) {
      console.error('Erro ao buscar dados armazenados', error);
    }
  };

  useEffect(() => {
    fetchStoredData();
    fetchGuildData();
    const interval = setInterval(fetchGuildData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyAllExivas = () => {
    if (!guildMembers) return;

    const exivaCommands = [
      ...guildMembers.members.Knight,
      ...guildMembers.members.Sorcerer,
      ...guildMembers.members.Paladin,
      ...guildMembers.members.Druid,
      ...guildMembers.members.MAKER
    ].map(member => `exiva "${member.name || 'Unknown'}"`).join('\n');

    navigator.clipboard.writeText(exivaCommands).then(() => {
      toast({
        title: 'Todos os exivas copiados para a área de transferência.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }).catch(err => {
      console.error('Failed to copy exiva commands:', err);
      toast({
        title: 'Failed to copy exiva commands.',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    });
  };

  return (
    <Container maxW="6xl" h="100vh" display="flex" flexDirection="column" gap="4">
      <Card bg="rgba(255, 255, 255, 0.2)" backdropFilter="blur(10px)">
        <CardHeader>
          <Heading color="white" as="h1" size="xl" noOfLines={1}>
            Enemy Monitor
          </Heading>
        </CardHeader>
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
            <Button colorScheme="teal" onClick={handleCopyAllExivas}>
              Copiar todos os exivas
            </Button>
          </Box>
          <Heading color="white" as="h2" size="lg" mt="4">
            Total Onlines: {totalOnline}
          </Heading>
          {guildMembers && (
            <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap="7">
              <GridItem>
                <Heading color="white" as="h2" size="lg" mt="4">
                  Elite Knights
                </Heading>
                <TableWidget
                  columns={columns}
                  data={guildMembers.members.Knight}
                  isLoading={isLoading}
                  respawnData={respawnData}
                  iconState={iconState}
                />
              </GridItem>
              <GridItem>
                <Heading color="white" as="h2" size="lg" mt="4">
                  Master Sorcerers
                </Heading>
                <TableWidget
                  columns={columns}
                  data={guildMembers.members.Sorcerer}
                  isLoading={isLoading}
                  respawnData={respawnData}
                  iconState={iconState}
                />
              </GridItem>
              <GridItem>
                <Heading color="white" as="h2" size="lg" mt="4">
                  Royal Paladins
                </Heading>
                <TableWidget
                  columns={columns}
                  data={guildMembers.members.Paladin}
                  isLoading={isLoading}
                  respawnData={respawnData}
                  iconState={iconState}
                />
              </GridItem>
              <GridItem>
                <Heading color="white" as="h2" size="lg" mt="4">
                  Elder Druids
                </Heading>
                <TableWidget
                  columns={columns}
                  data={guildMembers.members.Druid}
                  isLoading={isLoading}
                  respawnData={respawnData}
                  iconState={iconState}
                />
              </GridItem>
              <GridItem>
                <Heading color="white" as="h2" size="lg" mt="4">
                  MAKER
                </Heading>
                <TableWidget
                  columns={columns}
                  data={guildMembers.members.MAKER}
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
  );
};

export default HomePage;
