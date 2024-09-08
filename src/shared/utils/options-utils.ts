import { useToast } from '@chakra-ui/react';
import { vocationIcons } from '../../constant/character';
import { GuildMemberResponse } from '../interface/guild-member.interface';


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

export function getVocationIcon(vocation: string) {
  return vocationIcons[vocation] || '';
}