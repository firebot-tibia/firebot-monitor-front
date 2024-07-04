'use client';

import {
  Box,
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
import { getEnemyGuild } from '../../services/guilds';
import { TableWidget } from '../../components/table';

const HomePage: FC = () => {
  const [guildMembers, setGuildMembers] = useState<GuildDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const toast = useToast();

  const columns = useMemo(() => ['Vocation', 'Nome', 'Level', 'Respawn', 'PT'], []);

  const fetchGuildData = async () => {
    try {
      const response = await getEnemyGuild();
      const members = response.data.guild.members;
      setGuildMembers(response.data.guild);
      setIsLoading(false);

      const storedKeys = Object.keys(localStorage).filter(key => key.startsWith('respawn_'));
      const memberNames = members.Knight.concat(members.Sorcerer, members.Paladin, members.Druid, members.MAKER).map(member => member.name);
      storedKeys.forEach(key => {
        const name = key.replace('respawn_', '');
        if (!memberNames.includes(name)) {
          localStorage.removeItem(key);
        }
      });
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

  useEffect(() => {
    fetchGuildData();
    const interval = setInterval(fetchGuildData, 300000);

    return () => clearInterval(interval);
  }, []);

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
          </Box>
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
