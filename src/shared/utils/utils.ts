import { useToast } from "@chakra-ui/react";
import { vocationIcons } from "../../constant/character";
import { GuildMemberResponse } from "../interface/guild-member.interface";

export const formatExp = (value: number): string => {
    const absValue = Math.abs(value);
    if (absValue >= 1e9) {
      return (value / 1e9).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' bi';
    } else if (absValue >= 1e6) {
      return (value / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' mi';
    } else if (absValue >= 1e3) {
      return (value / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' mil';
    } else {
      return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
    }
  };


export const getTimeColor = (timeOnline: string) => {
  const [hours, minutes] = timeOnline.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  
  if (totalMinutes <= 5) return 'red.500';
  if (totalMinutes <= 15) return 'orange.500';
  if (totalMinutes <= 30) return 'yellow.500';
  return 'inherit';
};

export const clearLocalStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      const currentDomain = window.location.hostname;
      if (currentDomain === 'localhost' || currentDomain === 'monitor.firebot.run') {
        localStorage.removeItem('deathList');
      } 
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

export const parseDuration = (durationStr: string): number => {
  try {
    const [hours, minutes, seconds] = durationStr.split(/[hms]/).map(Number);
    return (hours || 0) * 3600 + (minutes || 0) * 60 + (seconds || 0);
  } catch (error) {
    console.error(`Error parsing duration: ${durationStr}`, error);
    return 0;
  }
};

export const formatDate = (dateInput: string | Date | undefined | null): string => {
  if (!dateInput) return 'Data desconhecida';
  
  let date: Date;
  if (typeof dateInput === 'string') {
    date = new Date(dateInput);
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    return 'Data inválida';
  }

  if (isNaN(date.getTime())) {
    return 'Data inválida';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const normalizeTimeOnline = (timeOnline: string): string => {
  return timeOnline && timeOnline.trim() !== '' ? timeOnline : '00:00:00';
};

export const isOnline = (member: GuildMemberResponse): boolean => {
  const normalizedTime = normalizeTimeOnline(member.TimeOnline);
  return normalizedTime !== '00:00:00';
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