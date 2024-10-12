import { useToast } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { upsertPlayer } from "../../../services/guilds";
import { useAudio, AudioControl } from "../../../shared/hooks/useAudio";
import { usePermissionCheck } from "../../../shared/hooks/usePermissionCheck";
import { useCharacterTypes } from "../../../shared/hooks/useType";
import { Death } from "../../../shared/interface/death.interface";
import { GuildMemberResponse } from "../../../shared/interface/guild/guild-member.interface";
import { Level } from "../../../shared/interface/level.interface";
import { useGlobalStore } from "../../../store/death-level-store";
import { useStorageStore } from "../../../store/storage-store";
import { useTokenStore } from "../../../store/token-decoded-store";
import { clearLocalStorage, formatTimeOnline } from "../../../shared/utils/utils";
import { useCharacterMonitoring } from "../../../components/guild/guild-table/hooks/useMonitor";

const isOnline = (member: GuildMemberResponse): boolean => {
  return member.OnlineStatus;
};

export const useHomeLogic = () => {
  const toast = useToast();
  const [guildData, setGuildData] = useState<GuildMemberResponse[]>([]);
  const [onlineTimes, setOnlineTimes] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const guildId = useStorageStore.getState().getItem('selectedGuildId', '');
  const { decodedToken, selectedWorld, initializeSSE, setSelectedWorld, decodeAndSetToken } = useTokenStore();
  const checkPermission = usePermissionCheck();
  const audioControls = useAudio([
    '/assets/notification_sound.mp3',
    '/assets/notification_sound2.wav'
  ]) as AudioControl[];
  
  const [firstAudio, secondAudio] = audioControls;
  
  const { types, addType } = useCharacterTypes(guildData);
  const sseInitialized = useRef(false);

  const mode = useStorageStore(state => state.getItem('monitorMode', 'enemy'));
  const setMode = useCallback((newMode: 'ally' | 'enemy') => {
    useStorageStore.getState().setItem('monitorMode', newMode);
  }, []);


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
    if (firstAudio.audioEnabled) {
      firstAudio.playAudio();
    }
  }, [addDeath, firstAudio]);

  const handleNewLevel = useCallback((newLevel: Level) => {
    if (newLevel.newLevel > newLevel.oldLevel) {
      addLevelUp(newLevel);
      if (secondAudio.audioEnabled) {
        secondAudio.playAudio();
      }
    } else {
      addLevelDown(newLevel);
    }
  }, [addLevelUp, addLevelDown, secondAudio]);

  const updateMemberData = useCallback((member: GuildMemberResponse, changes: Partial<GuildMemberResponse>) => {
    setGuildData(prevData => 
      prevData.map(m => 
        m.Name === member.Name ? { ...m, ...changes } : m
      )
    );
  }, []);

  const handleMessage = useCallback((data: any) => {
    if (data?.[mode]) {
      setGuildData(data[mode]);
      const initialOnlineTimes = data[mode].reduce((acc: {[key: string]: string}, member: GuildMemberResponse) => {
        if (member.OnlineStatus && member.OnlineSince) {
          const onlineSince = new Date(member.OnlineSince);
          const now = new Date();
          const diffInMinutes = (now.getTime() - onlineSince.getTime()) / 60000;
          acc[member.Name] = formatTimeOnline(diffInMinutes);
        } else {
          acc[member.Name] = "00:00:00";
        }
        return acc;
      }, {});
      setOnlineTimes(initialOnlineTimes);
    }
    if (data?.[`${mode}-changes`]) {
      Object.entries(data[`${mode}-changes`]).forEach(([name, change]: [string, any]) => {
        if (change.ChangeType === "logged-in") {
          updateMemberData(change.Member, { 
            OnlineStatus: true, 
            OnlineSince: change.Member.OnlineSince,
          });
          setOnlineTimes(prev => ({...prev, [change.Member.Name]: "00:00:00"}));
        } else if (change.ChangeType === "logged-out") {
          updateMemberData(change.Member, { 
            OnlineStatus: false, 
            OnlineSince: "",
          });
          setOnlineTimes(prev => ({...prev, [change.Member.Name]: "00:00:00"}));
        } else {
          updateMemberData(change.Member, change.Member);
        }
      });
    }
    if (data?.death) {
      handleNewDeath(data.death);
    }
    if (data?.level) {
      handleNewLevel(data.level);
    }
    setIsLoading(false);
  }, [mode, handleNewDeath, handleNewLevel, updateMemberData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineTimes(prevTimes => {
        const newTimes = {...prevTimes};
        guildData.forEach(member => {
          if (member.OnlineStatus && member.OnlineSince) {
            const onlineSince = new Date(member.OnlineSince);
            const now = new Date();
            const diffInMinutes = (now.getTime() - onlineSince.getTime()) / 60000;
            newTimes[member.Name] = formatTimeOnline(diffInMinutes);
          }
        });
        return newTimes;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [guildData]);

  useEffect(() => {
    if (status === 'authenticated' && session?.access_token) {
      decodeAndSetToken(session.access_token);
    }
  }, [status, session, decodeAndSetToken]);

  useEffect(() => {
    if (session && decodedToken && selectedWorld && !sseInitialized.current) {
      initializeSSE(handleMessage);
      sseInitialized.current = true;
    }
  }, [decodedToken, selectedWorld, mode, initializeSSE, handleMessage, session]);

  useEffect(() => {
    resetNewCounts();
  }, [mode, resetNewCounts]);

  const handleModeChange = useCallback(() => {
    clearLocalStorage();
    const newMode = mode === 'ally' ? 'enemy' : 'ally';
    setMode(newMode);
    sseInitialized.current = false;
    if (session && decodedToken && selectedWorld) {
      initializeSSE(handleMessage);
      sseInitialized.current = true;
    }
  }, [mode, setMode, session, decodedToken, selectedWorld, initializeSSE, handleMessage]);

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

      await upsertPlayer(playerData, selectedWorld);
      updateMemberData(member, { Local: newLocal });
    } catch (error) {
      console.error('Failed to update player:', error);
    }
  }, [guildId, checkPermission, selectedWorld, updateMemberData]);

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
  
      await upsertPlayer(playerData, selectedWorld);
      updateMemberData(member, { Kind: newClassification });
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
  }, [guildId, checkPermission, selectedWorld, updateMemberData, toast]);

  const groupedData = useMemo(() => {
    const typedData = types.map(type => ({
      type,
      data: guildData.filter(member => member.Kind === type).map(member => ({
        ...member,
        TimeOnline: onlineTimes[member.Name] || "00:00:00"
      })),
      onlineCount: guildData.filter(member => member.Kind === type && isOnline(member)).length
    }));

    const unclassified = {
      type: 'unclassified',
      data: guildData.filter(member => !member.Kind || !types.includes(member.Kind)).map(member => ({
        ...member,
        TimeOnline: onlineTimes[member.Name] || "00:00:00"
      })),
      onlineCount: guildData.filter(member => 
        (!member.Kind || !types.includes(member.Kind)) && isOnline(member)
      ).length
    };

    return [...typedData, unclassified].filter(group => group.data.length > 0);
  }, [types, guildData, onlineTimes]);

  const handleStartMonitoring = useCallback(() => {
    firstAudio.markUserInteraction();
    secondAudio.markUserInteraction();
  }, [firstAudio, secondAudio]);

  const monitoring = useCharacterMonitoring(guildData, types);

  return {
    mode,
    handleModeChange,
    handleWorldChange: setSelectedWorld,
    newDeathCount,
    newLevelUpCount,
    newLevelDownCount,
    deathList,
    levelUpList,
    levelDownList,
    guildData,
    isLoading,
    status,
    firstAudioEnabled: firstAudio.audioEnabled,
    playFirstAudio: firstAudio.playAudio,
    secondAudioEnabled: secondAudio.audioEnabled,
    playSecondAudio: secondAudio.playAudio,
    types,
    addType,
    handleLocalChange,
    handleClassificationChange,
    groupedData,
    handleStartMonitoring,
    ...monitoring,
  };
};