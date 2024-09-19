import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { GuildMemberResponse } from '../../../shared/interface/guild-member.interface';

const fixedTypes = ['main', 'maker', 'bomba', 'fracoks', 'exitados', 'mwall'];

export const useCharacterTypes = (guildData: GuildMemberResponse[]) => {
  const [types, setTypes] = useState<string[]>(fixedTypes);
  const toast = useToast();

  useEffect(() => {
    if (Array.isArray(guildData) && guildData.length > 0) {
      const allTypes = guildData.map(member => member.Kind);
      const uniqueTypes = Array.from(new Set(allTypes.filter(type => type && type.trim() !== '')));
      const combinedTypes = Array.from(new Set([...fixedTypes, ...uniqueTypes]));
      
      setTypes(combinedTypes);
    }
  }, [guildData]);

  const addType = useCallback((newType: string) => {
    setTypes(prevTypes => {
      if (prevTypes.includes(newType)) {
        toast({
          title: "Tipo já existe",
          description: `O tipo "${newType}" já está na lista.`,
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return prevTypes;
      }
      
      toast({
        title: "Novo tipo adicionado",
        description: `O tipo "${newType}" foi adicionado com sucesso.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      return [...prevTypes, newType];
    });
  }, [toast]);

  return { types, addType };
};