import { useState, useCallback, useMemo } from 'react';
import { useToast } from '@chakra-ui/react';
import { upsertPlayer } from '../../../services/guilds';
import { UpsertPlayerInput } from '../../interface/character-upsert.interface';
import { GuildMemberResponse } from '../../../interface/guild-member.interface';

const fixedTypes = ['main', 'maker', 'bomba', 'fracoks', 'exitados', 'mwall'];

export const useCharacterTypes = (guildData: GuildMemberResponse[], session: any | null | undefined, mode: 'enemy' | 'ally') => {
  const [customTypes, setCustomTypes] = useState<string[]>([]);
  const toast = useToast();

  const guildId = useMemo(() => {
    if (session?.user) {
      if (mode === 'enemy') {
        return session.user.enemy_guild;
      } else if (mode === 'ally') {
        return session.user.ally_guild;
      }
    }
    return null;
  }, [session, mode]);

  const types = useMemo(() => {
    if (Array.isArray(guildData) && guildData.length > 0) {
      const allTypes = guildData.map(member => member.Kind);
      const uniqueTypes = Array.from(new Set(allTypes.filter(type => type && type.trim() !== '')));
      return Array.from(new Set([...fixedTypes, ...customTypes, ...uniqueTypes]));
    }
    return [...fixedTypes, ...customTypes];
  }, [guildData, customTypes]);

  const addType = useCallback(async (newType: string) => {
    if (!guildId) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o tipo. Sessão não iniciada.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if ([...fixedTypes, ...customTypes].includes(newType)) {
      toast({
        title: "Tipo já existe",
        description: `O tipo "${newType}" já está na lista.`,
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const playerData: UpsertPlayerInput = {
      guild_id: guildId,
      kind: newType,
    };

    try {
      await upsertPlayer(playerData);

      setCustomTypes(prevTypes => [...prevTypes, newType]);

      toast({
        title: "Novo tipo adicionado",
        description: `O tipo "${newType}" foi adicionado com sucesso.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao adicionar novo tipo:', error);
      toast({
        title: "Erro ao adicionar tipo",
        description: "Ocorreu um erro ao tentar adicionar o novo tipo. Por favor, tente novamente.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast, guildId, customTypes]);

  return { types, addType };
};