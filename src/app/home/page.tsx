'use client';

import { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { Badge, Box, Flex, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs, VStack, useToast } from '@chakra-ui/react';
import DashboardLayout from '../../components/layout';
import { useSession } from 'next-auth/react';
import { upsertPlayer } from '../../services/guilds';
import { useAudio } from '../../shared/hooks/useAudio';
import { usePermissionCheck } from '../../shared/hooks/usePermissionCheck';
import { useCharacterTypes } from '../../shared/hooks/useType';
import { GuildMemberResponse } from '../../shared/interface/guild/guild-member.interface';
import { normalizeTimeOnline, isOnline } from '../../shared/utils/utils';
import { DeathSection } from '../../components/guild/sections/death-section';
import GuildDataSection from '../../components/guild/sections/guild-data-section';
import InstructionsSection from '../../components/guild/sections/instructions-section';
import MonitorToggleSection from '../../components/guild/sections/monitor-toggle-section';
import { useEventSource } from '../../shared/hooks/useEvent';
import { useLocalStorageMode } from '../../shared/hooks/useStorage';
import { useDeathData } from '../../shared/hooks/useDeath';

const Home: FC = () => {  
  const [mode, setMode] = useLocalStorageMode('monitorMode', 'enemy');
  const { newDeathCount, deathList, handleNewDeath } = useDeathData(mode);
  const toast = useToast();
  const [guildData, setGuildData] = useState<GuildMemberResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [guildId, setGuildId] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const checkPermission = usePermissionCheck();
  const { audioEnabled, playAudio } = useAudio('/assets/notification_sound.mp3');
  const { types, addType } = useCharacterTypes(guildData, session, mode);

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
      <InstructionsSection />
      <Box maxWidth="100%" overflow="hidden" fontSize={["xs", "sm", "md"]}>
        <VStack spacing={4} align="stretch">
          <MonitorToggleSection guildData={guildData} isLoading={isLoading} />
          <Tabs isFitted variant="enclosed">
          <TabList mb="1em">
              <Tab>Monitoramento de Guilds</Tab>
              <Tab>
                Lista de Mortes
                {newDeathCount > 0 && (
                  <Badge ml={2} colorScheme="red" borderRadius="full">
                    {newDeathCount}
                  </Badge>
                )}
              </Tab>
              <Tab>Lista de Level Up</Tab>
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
                handleNewDeath={handleNewDeath}
                playAudio={playAudio}
                audioEnabled={audioEnabled}
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