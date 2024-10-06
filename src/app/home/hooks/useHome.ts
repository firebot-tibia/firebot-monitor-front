import { useToast } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { upsertPlayer } from "../../../services/guilds";
import { AudioControl, useAudio } from "../../../shared/hooks/useAudio";
import { useEventSource } from "../../../shared/hooks/useEvent";
import { usePermissionCheck } from "../../../shared/hooks/usePermissionCheck";
import { useLocalStorageMode } from "../../../shared/hooks/useStorage";
import { useCharacterTypes } from "../../../shared/hooks/useType";
import { GuildMemberResponse } from "../../../shared/interface/guild/guild-member.interface";
import { normalizeTimeOnline, isOnline } from "../../../shared/utils/utils";
import { useDeathData } from "./useDeathLevel";


export const useHomeLogic = () => {
  const [mode, setMode] = useLocalStorageMode('monitorMode', 'enemy');
  const { newDeathCount, newLevelUpCount, newLevelDownCount, deathList, levelUpList, levelDownList } = useDeathData(mode);
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
  
  const { audioEnabled: firstAudioEnabled, playAudio: playFirstAudio } = firstAudio;
  const { audioEnabled: secondAudioEnabled, playAudio: playSecondAudio } = secondAudio;
  
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
    error
  };
};