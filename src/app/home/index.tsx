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
import { getEnemyGuild } from '../../services/guilds';
import { TableWidget } from '../../components/table';

const HomePage: FC = () => {
  const [guildMembers, setGuildMembers] = useState<GuildDTO | null>(null);
  const [totalOnline, setTotalOnline] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const toast = useToast();
  const columns = useMemo(() => ['Voc', 'Nome', 'Lvl', 'Ultimo Exiva', 'PT'], []);

  const fetchGuildData = async () => {
    try {
      const response = await getEnemyGuild();
      const members = response.data.guild.members;
      setGuildMembers(response.data.guild);
      setTotalOnline(response.data.guild.total_online);
      setIsLoading(false);
  
      const allMembers = members.Knight.concat(members.Sorcerer, members.Paladin, members.Druid, members.MAKER);
      allMembers.forEach((member: { name: any; }) => {
        const memberData = JSON.stringify(member);
        localStorage.setItem(`respawn_${member.name}`, memberData);
      });
  
      const storedKeys = Object.keys(localStorage).filter(key => key.startsWith('respawn_'));
      const memberNames = allMembers.map((member: { name: any; }) => member.name);
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
    const storedMembers = Object.keys(localStorage)
      .filter(key => key.startsWith('respawn_'))
      .map(key => localStorage.getItem(key))
      .filter(item => item !== null)
      .map((item :any) => JSON.parse(item));
  
    if (storedMembers.length > 0) {
      const initialGuildData: any = { 
        total_online: 0,
        members: { Knight: [], Sorcerer: [], Paladin: [], Druid: [], MAKER: [] }, 
      };
  
      storedMembers.forEach(member => {
        if (
          member.vocation === 'Knight' ||
          member.vocation === 'Sorcerer' ||
          member.vocation === 'Paladin' ||
          member.vocation === 'Druid' ||
          member.vocation === 'MAKER'
        ) {
          initialGuildData.members[member.vocation].push(member);
        }
      });
  
      setGuildMembers(initialGuildData);
    }
  
    fetchGuildData();
    const interval = setInterval(fetchGuildData, 8000);
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
