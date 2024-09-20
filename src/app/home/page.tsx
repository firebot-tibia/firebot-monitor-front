'use client';

import React, { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Spinner, VStack, useToast } from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard';
import { GuildMemberResponse } from '../../shared/interface/guild-member.interface';
import { useSession } from 'next-auth/react';
import { upsertPlayer } from '../../services/guilds';
import { useEventSource } from '../../hooks/events/useEvent';
import { useCharacterTypes } from '../../hooks/characters/types/useType';
import { normalizeTimeOnline, isOnline } from '../../shared/utils/guild-utils';
import DeathSection from '../../components/guild/death-section';
import GuildDataSection from '../../components/guild/guild-data-section';
import InstructionsSection from '../../components/guild/instructions-section';
import MonitorToggleSection from '../../components/guild/monitor-toggle-section';
import { useLocalStorageMode } from '../../hooks/useLocalStorageParse';
import { useDeathData } from '../../hooks/deaths/useDeathHook';


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

  const handleLocalChange = useCallback(async (member: GuildMemberResponse, newLocal: string) => {
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
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <Spinner size="xl" />
        </Box>
      </DashboardLayout>
    );
  }

  return (
   <DashboardLayout mode={mode} setMode={setMode}>
      <Box maxWidth="100%" overflow="hidden" fontSize="xs">
        <VStack spacing={1} align="stretch">
          <InstructionsSection />
          <MonitorToggleSection guildData={guildData} isLoading={isLoading} />
          <GuildDataSection
            isLoading={isLoading}
            guildData={guildData}
            groupedData={groupedData}
            handleLocalChange={handleLocalChange}
            handleClassificationChange={handleClassificationChange}
            types={types}
            addType={addType}
          />
          <DeathSection
            deathList={deathList}
            newDeathCount={newDeathCount}
            handleNewDeath={handleNewDeath}
          />
        </VStack>
      </Box>
    </DashboardLayout>
  );
};

export default Home;