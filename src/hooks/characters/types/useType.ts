import { useState, useCallback, useMemo } from 'react';
import { useToast } from '@chakra-ui/react';
import { GuildMemberResponse } from '../../../shared/interface/guild-member.interface';

const fixedTypes = ['main', 'maker', 'bomba', 'fracoks', 'exitados', 'mwall'];

export const useCharacterTypes = (guildData: GuildMemberResponse[]) => {
  const [customTypes, setCustomTypes] = useState<string[]>([]);
  const toast = useToast();

  const types = useMemo(() => {
    if (Array.isArray(guildData) && guildData.length > 0) {
      const allTypes = guildData.map(member => member.Kind);
      const uniqueTypes = Array.from(new Set(allTypes.filter(type => type && type.trim() !== '')));
      return Array.from(new Set([...fixedTypes, ...customTypes, ...uniqueTypes]));
    }
    return [...fixedTypes, ...customTypes];
  }, [guildData, customTypes]);

  const addType = useCallback((newType: string) => {
    setCustomTypes(prevTypes => {
      if ([...fixedTypes, ...prevTypes].includes(newType)) {
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