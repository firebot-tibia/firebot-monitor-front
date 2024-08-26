import { useToast } from '@chakra-ui/react';
import { vocationIcons } from '../../constant/character';
import { GuildMemberResponse } from '../interface/guild-member.interface';

export const copyAllNames = (data: any[], toast: ReturnType<typeof useToast>) => {
  const allNames = data.map(row => row.character.name).join(', ');
  navigator.clipboard.writeText(allNames);
  toast({
    title: 'Todos os nomes copiados para a área de transferência.',
    status: 'success',
    duration: 2000,
    isClosable: true,
  });
};

export const copyAllExivas = (data: any[], toast: ReturnType<typeof useToast>) => {
  const allExivas = data.map(row => `exiva "${row.character.name}"`).join('\n');
  navigator.clipboard.writeText(allExivas);
  toast({
    title: 'Todos os exivas copiados para a área de transferência.',
    status: 'success',
    duration: 2000,
    isClosable: true,
  });
};

export const copyExivas = (data: GuildMemberResponse, toast: ReturnType<typeof useToast>) => {
  const exivas = `exiva "${data.Name.trim().toLowerCase()}"`;
  navigator.clipboard.writeText(exivas);
  toast({
    title: 'Exiva copiado para a área de transferência.',
    status: 'success',
    duration: 2000,
    isClosable: true,
  });
};

export function getVocationIcon(vocation: string) {
  return vocationIcons[vocation] || '';
}

export function handleCopy(name: string | undefined, toast: ReturnType<typeof useToast>) {
  const displayName = getName(name);
  toast({
    title: `"${displayName}" copiado para a área de transferência.`,
    status: 'success',
    duration: 2000,
    isClosable: true,
  });
}

export function getName(name: string | undefined): string {
  return name || 'Desconhecido';
}