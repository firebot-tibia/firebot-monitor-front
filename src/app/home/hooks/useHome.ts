import { useToast } from "@chakra-ui/react";
import { getSession, useSession } from "next-auth/react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { upsertPlayer } from "../../../services/guilds";
import { AudioControl, useAudio } from "../../../shared/hooks/useAudio";
import { usePermissionCheck } from "../../../shared/hooks/usePermissionCheck";
import { useLocalStorageMode } from "../../../shared/hooks/useStorage";
import { useCharacterTypes } from "../../../shared/hooks/useType";
import { GuildMemberResponse } from "../../../shared/interface/guild/guild-member.interface";
import { Death } from '../../../shared/interface/death.interface';
import { Level } from '../../../shared/interface/level.interface';
import { normalizeTimeOnline, isOnline } from "../../../shared/utils/utils";
import useEventSourceGlobal from "../../../store/event-source-store";
import { useGlobalStore } from '../../../store/death-level-store';

export const useHomeLogic = () => {
  const [mode, setMode] = useLocalStorageMode('monitorMode', 'enemy');
  const toast = useToast();
  const [guildData, setGuildData] = useState<GuildMemberResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [guildId, setGuildId] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const checkPermission = usePermissionCheck();
  const audioControls = useAudio([
    '/assets/notification_sound.mp3',
    '/assets/notification_sound2.wav'
  ]) as AudioControl[];
  
  const [firstAudio, secondAudio] = audioControls;
  
  const { audioEnabled: firstAudioEnabled, playAudio: playFirstAudio, markUserInteraction: markFirstAudioInteraction } = firstAudio;
  const { audioEnabled: secondAudioEnabled, playAudio: playSecondAudio, markUserInteraction: markSecondAudioInteraction } = secondAudio;
  
  const { types, addType } = useCharacterTypes(guildData, session, mode);

  const {
    deathList,
    levelUpList,
    levelDownList,
    newDeathCount,
    newLevelUpCount,
    newLevelDownCount,
    addDeath,
    addLevelUp,
    addLevelDown,
    resetNewCounts,
  } = useGlobalStore();

  const handleNewDeath = useCallback((newDeath: Death) => {
    addDeath(newDeath);
    if (firstAudioEnabled) {
      playFirstAudio();
    }
  }, [addDeath, firstAudioEnabled, playFirstAudio]);

  const handleNewLevel = useCallback((newLevel: Level) => {
    if (newLevel.newLevel > newLevel.oldLevel) {
      addLevelUp(newLevel);
      if (secondAudioEnabled) {
        playSecondAudio();
      }
    } else {
      addLevelDown(newLevel);
    }
  }, [addLevelUp, addLevelDown, secondAudioEnabled, playSecondAudio]);

  const handleMessage = useCallback((data: any) => {
    if (data?.[mode]) {
      setGuildData(data[mode]);
    }
    if (data?.death) {
      const newDeath: Death = {
        ...data.death,
        date: new Date(data.death.date || Date.now()),
        death: data.death.text,
      };
      handleNewDeath(newDeath);
    }
    if (data?.level) {
      const newLevel: Level = {
        character: data.level.player,
        newLevel: data.level.new_level,
        oldLevel: data.level.old_level,
        date: new Date(Date.now()),
      };
      handleNewLevel(newLevel);
    }
    setIsLoading(false);
  }, [mode, handleNewDeath, handleNewLevel]);

  useEffect(() => {
    if (status === 'authenticated') {
      const baseUrl = `https://api.firebot.run/subscription/${mode}/`;
      const setupSource = async () => {
        await useEventSourceGlobal.getState().setupEventSource(
          baseUrl,
          getSession,
          handleMessage
        );
      };
      setupSource();
  
      return () => {
        useEventSourceGlobal.getState().closeEventSource();
      };
    }
  }, [status, mode]);

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

  useEffect(() => {
    resetNewCounts();
  }, [mode, resetNewCounts]);

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
  }, [guildId, checkPermission]);

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
  }, [guildId, checkPermission, toast]);

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

  const markUserInteraction = useCallback(() => {
    markFirstAudioInteraction();
    markSecondAudioInteraction();
  }, [markFirstAudioInteraction, markSecondAudioInteraction]);

  const handleStartMonitoring = useCallback(() => {
    markUserInteraction();
    console.log('Monitoramento iniciado');
  }, [markUserInteraction]);

  return {
    mode,
    setMode,
    newDeathCount,
    newLevelUpCount,
    newLevelDownCount,
    deathList,
    levelUpList,
    levelDownList,
    guildData,
    isLoading,
    status,
    firstAudioEnabled,
    playFirstAudio,
    secondAudioEnabled,
    playSecondAudio,
    types,
    addType,
    handleLocalChange,
    handleClassificationChange,
    groupedData,
    handleStartMonitoring,
    markUserInteraction,
  };
};