'use client';

import { useEffect, useState, useMemo, FC, useCallback } from 'react';
import { Box, Spinner, Grid, useToast, Text } from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard';
import { GuildMemberResponse } from '../../shared/interface/guild-member.interface';
import { useSession } from 'next-auth/react';
import { copyExivas } from '../../shared/utils/options-utils';
import { upsertPlayer } from '../../services/guilds';
import { useEventSource } from '../../hooks/useEvent';
import { GuildMemberTable } from '../../components/guild';
import { UpsertPlayerInput } from '../../shared/interface/character-upsert.interface';

const Home: FC = () => {
  const [guildData, setGuildData] = useState<GuildMemberResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enemyGuildId, setEnemyGuildId] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const toast = useToast();

  const handleMessage = useCallback((data: any) => {
    if (data?.enemy) {
      setGuildData(data.enemy);
    }
    setIsLoading(false);
  }, []);

  const { error } = useEventSource(
    status === 'authenticated' ? `https://api.firebot.run/subscription/enemy/` : null,
    handleMessage
  );

  useEffect(() => {
    if (error) {
      toast({
        title: 'Erro de conexão',
        description: `Houve um problema ao conectar com o servidor: ${error.message}. Tentando reconectar...`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (status === 'authenticated' && session?.access_token) {
      try {
        const decoded = JSON.parse(atob(session.access_token.split('.')[1]));
        if (decoded?.enemy_guild) {
          setEnemyGuildId(decoded.enemy_guild);
        }
      } catch (error) {
        console.error('Error decoding access token:', error);
      }
    }
  }, [status, session, toast]);

  const handleLocalChange = async (member: GuildMemberResponse, newLocal: string) => {
    if (!enemyGuildId) {
      toast({
        title: 'Erro',
        description: 'ID da guilda inimiga não disponível.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const playerData: UpsertPlayerInput = {
        guild_id: enemyGuildId,
        kind: member.Kind,
        name: member.Name,
        status: member.Status,
        local: newLocal,
      };

      await upsertPlayer(playerData);
    } catch (error) {
      console.error('Failed to update player:', error);
    }
  };

  const handleMemberClick = useCallback((member: GuildMemberResponse) => {
    copyExivas(member, toast);
  }, [toast]);

  const types = useMemo(() => ['main', 'maker', 'bomba', 'fracoks', 'exitados'], []);

  const unclassifiedMembers = useMemo(() => 
    guildData.filter(member => !member.Kind || !types.includes(member.Kind)),
    [guildData, types]
  );

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <Spinner size="xl" />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4} w="full">
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <Spinner size="xl" />
          </Box>
        ) : guildData.length === 0 ? (
          <Box textAlign="center" fontSize="xl" mt={10}>
            <Text>Nenhum dado de guilda disponível.</Text>
          </Box>
        ) : (
          <>
            {types.map((type) => {
              const filteredData = guildData.filter(member => member.Kind === type);
              if (filteredData.length > 0) {
                return (
                  <Box key={type} w="full" bg="gray.800" p={4} rounded="lg" shadow="md">
                    <GuildMemberTable
                      data={filteredData}
                      onLocalChange={handleLocalChange}
                      onMemberClick={handleMemberClick}
                    />
                  </Box>
                );
              }
              return null;
            })}
            {unclassifiedMembers.length > 0 && (
              <Box w="full" bg="gray.800" p={4} rounded="lg" shadow="md">
                <Text mb={2} fontWeight="bold">Personagens Sem Classificação</Text>
                <GuildMemberTable
                  data={unclassifiedMembers}
                  onLocalChange={handleLocalChange}
                  onMemberClick={handleMemberClick}
                />
              </Box>
            )}
          </>
        )}
      </Grid>
    </DashboardLayout>
  );
};

export default Home;