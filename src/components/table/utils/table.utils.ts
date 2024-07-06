
import { useToast } from '@chakra-ui/react';
import { CharacterRespawnDTO } from '../../../shared/interface/character-list.interface';

export const copyAllNames = (data: CharacterRespawnDTO[], toast: ReturnType<typeof useToast>) => {
  const allNames = data.map(row => row.character.name).join(', ');
  navigator.clipboard.writeText(allNames);
  toast({
    title: 'Todos os nomes copiados para a área de transferência.',
    status: 'success',
    duration: 2000,
    isClosable: true,
  });
};

export const copyAllExivas = (data: CharacterRespawnDTO[], toast: ReturnType<typeof useToast>) => {
  const allExivas = data.map(row => `exiva "${row.character.name}"`).join('\n');
  navigator.clipboard.writeText(allExivas);
  toast({
    title: 'Todos os exivas copiados para a área de transferência.',
    status: 'success',
    duration: 2000,
    isClosable: true,
  });
};
