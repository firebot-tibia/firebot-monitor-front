import { useState, useCallback, useEffect } from 'react';
import { GuildMemberResponse } from '../shared/interface/guild-member.interface';
import { Death } from '../shared/interface/death.interface';
import { useSession } from 'next-auth/react';
import { upsertPlayer } from '../services/guilds';
import { useToast } from '@chakra-ui/react';
import { useEventSource } from './events/useEvent';

export const useSSEData = () => {
  const [guildData, setGuildData] = useState<GuildMemberResponse[]>([]);
  const [deathList, setDeathList] = useState<Death[]>([]);
  const [newDeathCount, setNewDeathCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [enemyGuildId, setEnemyGuildId] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const toast = useToast();

  const handleMessage = useCallback((data: any) => {
    if (data?.enemy) {
      setGuildData(data.enemy);
      setIsLoading(false);
    }
    if (data?.death) {
      const newDeath: Death = {
        ...data.death,
        date: new Date(data.death.date || Date.now()),
        death: data.death.text,
      };
      setDeathList(prev => [...prev, newDeath]);
      setNewDeathCount(prev => prev + 1);
      toast({
        title: "Nova morte registrada",
        description: `${newDeath.name} morreu.`,
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  const { error } = useEventSource(
    status === 'authenticated' ? `https://api.firebot.run/subscription/enemy` : null,
    handleMessage
  );

  useEffect(() => {
    if (error) {
      console.error('Connection error:', error);
    }
  }, [error, toast]);

  useEffect(() => {
    if (status === 'authenticated' && session?.access_token) {
      try {
        console.log('Refreshing:');
        const decoded = JSON.parse(atob(session.access_token.split('.')[1]));
        if (decoded?.enemy_guild) {
          setEnemyGuildId(decoded.enemy_guild);
        }
      } catch (error) {
        console.error('Error decoding access token:', error);
      }
    }
  }, [status, session]);

  const handleLocalChange = useCallback(async (member: GuildMemberResponse, newLocal: string) => {
    if (!enemyGuildId) return;

    try {
      const playerData = {
        guild_id: enemyGuildId,
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
      toast({
        title: "Erro ao atualizar jogador",
        description: "Não foi possível atualizar a localização do jogador.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [enemyGuildId, toast]);

  const handleClassificationChange = useCallback(async (member: GuildMemberResponse, newClassification: string) => {
    if (!enemyGuildId) return;
  
    try {
      const playerData = {
        guild_id: enemyGuildId,
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
      toast({
        title: "Erro ao classificar jogador",
        description: "Não foi possível atualizar a classificação do jogador.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [enemyGuildId, toast]);

  return {
    guildData,
    deathList,
    newDeathCount,
    isLoading,
    handleLocalChange,
    handleClassificationChange,
    status
  };
};