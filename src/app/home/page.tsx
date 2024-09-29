'use client';

import { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Flex, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs, VStack, useToast } from '@chakra-ui/react';
import DashboardLayout from '../../components/layout';
import { GuildMemberResponse } from '../../shared/interface/guild-member.interface';
import { useSession } from 'next-auth/react';
import { upsertPlayer } from '../../services/guilds';
import { useEventSource } from '../../hooks/events/useEvent';
import { useCharacterTypes } from '../../hooks/characters/types/useType';
import GuildDataSection from '../../components/guild/sections/guild-data-section';
import InstructionsSection from '../../components/guild/sections/instructions-section';
import MonitorToggleSection from '../../components/guild/sections/monitor-toggle-section';
import { useLocalStorageMode } from '../../hooks/global/useLocalStorageParse';
import { useDeathData } from '../../hooks/deaths/useDeathHook';
import DeathSection from '../../components/guild/sections/death-section';
import { normalizeTimeOnline, isOnline } from '../../shared/utils/utils';


const Home: FC = () => {  
  const [mode, setMode] = useLocalStorageMode('monitorMode', 'enemy');
  const { newDeathCount, deathList, handleNewDeath } = useDeathData(mode);
  const toast = useToast();
  const [guildData, setGuildData] = useState<GuildMemberResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [guildId, setGuildId] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const { types, addType } = useCharacterTypes(guildData);

  const handleMessage = useCallback((data: any) => {
    if (data?.[mode]) {
      setGuildData(data[mode]);
    }
    setIsLoading(false);
  }, [mode]);

  const { error } = useEventSource(
    status === 'authenticated' ? `https://api.firebot.run/subscription/${mode}/` : null,
    handleMessage
  );

  useEffect(() => {
    if (status === 'authenticated' && session?.access_token) {
      try {
        const decoded = JSON.parse(atob(session.access_token.split('.')[1]));
        if (decoded?.[`${mode}_guild`]) {
          setGuildId(decoded[`${mode}_guild`]);
        }
      } catch (error) {
        console.error('Error decoding access token:', error);
      }
    }
  }, [status, session, mode]);

  const checkPermission = useCallback(() => {
    if (!session?.access_token) {
      toast({
        title: 'Erro de autenticação',
        description: 'Sua sessão não é válida. Por favor, faça login novamente.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
  
    try {
      const payload = session.access_token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      const userStatus = decoded?.status;
  
      if (userStatus !== 'admin' && userStatus !== 'editor') {
        toast({
          title: 'Permissão negada',
          description: 'Você não tem permissão para editar estas informações.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return false;
      }
      return true;
    } catch (error) {
      console.error('Erro ao decodificar o token:', error);
      return false;
    }
  }, [session, toast]);

  const handleLocalChange = useCallback(async (member: GuildMemberResponse, newLocal: string) => {
    if (!checkPermission()) return;
    if (!guildId) return;

    try {
      const playerData = {
        guild_id: guildId,
        kind: member.Kind,
        name: member.Name,
        status: member.Status,
        local: newLocal,
      };

      await upsertPlayer(playerData);
      setGuildData(prevData =>
        prevData.map(m =>
          m.Name === member.Name ? { ...m, Local: newLocal } : m
        )
      );
    } catch (error) {
      console.error('Failed to update player:', error);
    }
  }, [guildId]);

  const handleClassificationChange = useCallback(async (member: GuildMemberResponse, newClassification: string) => {
    if (!checkPermission()) return;
    if (!guildId) return;
  
    try {
      const playerData = {
        guild_id: guildId,
        kind: newClassification,
        name: member.Name,
        status: member.Status,
        local: member.Local || '',
      };
  
      await upsertPlayer(playerData);
      setGuildData(prevData => 
        prevData.map(m => 
          m.Name === member.Name ? { ...m, Kind: newClassification } : m
        )
      );
      toast({
        title: 'Sucesso',
        description: `${member.Name} classificado como ${newClassification}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to classify player:', error);
    }
  }, [guildId, toast]);

  const groupedData = useMemo(() => {
    const typedData = types.map(type => ({
      type,
      data: guildData.filter(member => member.Kind === type).map(member => ({
        ...member,
        TimeOnline: normalizeTimeOnline(member.TimeOnline)
      })),
      onlineCount: guildData.filter(member => member.Kind === type && isOnline(member)).length
    }));

    const unclassified = {
      type: 'unclassified',
      data: guildData.filter(member => !member.Kind || !types.includes(member.Kind)).map(member => ({
        ...member,
        TimeOnline: normalizeTimeOnline(member.TimeOnline)
      })),
      onlineCount: guildData.filter(member => 
        (!member.Kind || !types.includes(member.Kind)) && isOnline(member)
      ).length
    };

    return [...typedData, unclassified].filter(group => group.data.length > 0);
  }, [types, guildData]);


  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout mode={mode} setMode={setMode}>
        <Flex justify="center" align="center" height="100vh">
          <Spinner size="xl" />
        </Flex>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout mode={mode} setMode={setMode}>
      <Box maxWidth="100%" overflow="hidden" fontSize={["xs", "sm", "md"]}>
        <VStack spacing={4} align="stretch">
          <InstructionsSection />
          <MonitorToggleSection guildData={guildData} isLoading={isLoading} />
          <Tabs isFitted variant="enclosed">
            <TabList mb="1em">
              <Tab>Monitoramento de Guilds</Tab>
              <Tab>Lista de Mortes</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <GuildDataSection
                  isLoading={isLoading}
                  guildData={guildData}
                  groupedData={groupedData}
                  handleLocalChange={handleLocalChange}
                  handleClassificationChange={handleClassificationChange}
                  types={types}
                  addType={addType}
                />
              </TabPanel>
              <TabPanel>
                <DeathSection
                  deathList={deathList}
                  newDeathCount={newDeathCount}
                  handleNewDeath={handleNewDeath}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Box>
    </DashboardLayout>
  );
};

export default Home;