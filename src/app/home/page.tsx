'use client';

import { useToast, Flex, Spinner, VStack, Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react";
import { Box, Badge } from "lucide-react";
import { useSession } from "next-auth/react";
import { FC, useState, useEffect, useCallback, useMemo } from "react";
import { DeathSection } from "../../components/guild/sections/death-section";
import GuildDataSection from "../../components/guild/sections/guild-data-section";
import InstructionsSection from "../../components/guild/sections/instructions-section";
import MonitorToggleSection from "../../components/guild/sections/monitor-toggle-section";
import DashboardLayout from "../../components/layout";
import { upsertPlayer } from "../../services/guilds";
import { useCharacterTypes } from "../../shared/hooks/types/useType";
import { useAudio } from "../../shared/hooks/global/useAudio";
import { usePermissionCheck } from "../../shared/hooks/global/usePermissionCheck";
import { GuildMemberResponse } from "../../shared/interface/guild/guild-member.interface";
import { normalizeTimeOnline, isOnline } from "../../shared/utils/utils";
import { useGuildStore } from "../../store/guild-store";
import useSSEStore from "../../store/sse-store";
import { useAuthStore } from "../../store/auth-store";


const Home: FC = () => {  
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [guildId, setGuildId] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const checkPermission = usePermissionCheck();
  const { audioEnabled, playAudio } = useAudio('/assets/notification_sound.mp3');

  const { enemyGuildData: guildEnemyData, allyGuildData: guildAllyData, setEnemyGuildData, setAllyGuildData } = useGuildStore();
  const { 
    enemyGuildData: sseEnemyData, 
    allyGuildData: sseAllyData, 
    error: sseError, 
    deathList,
    newDeathCount,
    setupEventSource,
    mode,
    setMode
  } = useSSEStore();

  const guildData = mode === 'enemy' ? guildEnemyData : guildAllyData;
  const setGuildData = mode === 'enemy' ? setEnemyGuildData : setAllyGuildData;
  const { types, addType } = useCharacterTypes(guildData, session, mode);
  const { accessToken, refreshToken, setTokens, isTokenExpired } = useAuthStore();

  const refreshTokenFunc = useCallback(async () => {
    if (!refreshToken) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refresh`, {
        method: 'POST',
        headers: { 'x-refresh-token': refreshToken },
      });
      if (!response.ok) throw new Error('Failed to refresh token');
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await response.json();
      setTokens(newAccessToken, newRefreshToken);
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  }, [refreshToken, setTokens]);

  useEffect(() => {
    if (status === 'authenticated' && session?.access_token) {
      try {
        const decoded = JSON.parse(atob(session.access_token.split('.')[1]));
        if (decoded?.[`${mode}_guild`]) {
          setGuildId(decoded[`${mode}_guild`]);
        }
        console.log('Setting up SSE connection');
        setupEventSource(`${process.env.NEXT_PUBLIC_API_URL}/subscription`,
          () => accessToken,
          () => refreshToken,
          refreshTokenFunc
        );
      } catch (error) {
        console.error('Error setting up SSE:', error);
      }
    }
  }, [status, accessToken, refreshToken, mode, setupEventSource, refreshTokenFunc]);

  useEffect(() => {
    if (guildData.length > 0) {
      setIsLoading(false);
    }
  }, [guildData]);

  useEffect(() => {
    if (mode === 'enemy' && sseEnemyData) {
      setEnemyGuildData(sseEnemyData);
    } else if (mode === 'ally' && sseAllyData) {
      setAllyGuildData(sseAllyData);
    }
  }, [sseEnemyData, sseAllyData, mode, setEnemyGuildData, setAllyGuildData]);



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
      const updatedGuildData = guildData.map((m) =>
        m.Name === member.Name ? { ...m, Local: newLocal } : m
      );
      setGuildData(updatedGuildData);
    } catch (error) {
      console.error('Failed to update player:', error);
    }
  }, [guildId, checkPermission, guildData, setGuildData]);

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
      const updatedGuildData = guildData.map((m) => 
        m.Name === member.Name ? { ...m, Kind: newClassification } : m
      );
      setGuildData(updatedGuildData);
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
  }, [guildId, checkPermission, guildData, setGuildData, toast]);

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
      <Box overflow="hidden">
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