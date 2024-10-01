import { useToast } from "@chakra-ui/react";
import { vocationIcons } from "../../constant/character";
import { GuildMemberResponse } from "../interface/guild-member.interface";
import { format, parse } from 'date-fns';

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

const capitalizeWords = (str: string) => {
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export const copyExivas = (data: GuildMemberResponse, toast: ReturnType<typeof useToast>) => {
  const capitalizedName = capitalizeWords(data.Name.trim());
  const exivas = `exiva "${capitalizedName}`;
  navigator.clipboard.writeText(exivas);
  toast({
    title: 'Exiva copiado para a área de transferência.',
    status: 'success',
    duration: 2000,
    isClosable: true,
  });
};

export function getName(name: string | undefined): string {
  return name || 'Desconhecido';
}

export function getVocationIcon(vocation: string) {
  return vocationIcons[vocation] || '';
}


export const formatTimeSlot = (timeString: string): string => {
  const [start, end] = timeString.split(' - ');
  const currentDate = new Date();
  const startDate = new Date(currentDate.setHours(parseInt(start.split(':')[0]), parseInt(start.split(':')[1])));
  const endDate = new Date(currentDate.setHours(parseInt(end.split(':')[0]), parseInt(end.split(':')[1])));
  
  return `${format(startDate, 'dd/MM/yyyy-HH:mm')} - ${format(endDate, 'dd/MM/yyyy-HH:mm')}`;
};

export const defaultTimeSlots = [
  "05:10 - 09:30", "09:31 - 12:40", "12:41 - 15:50", "15:51 - 19:00",
  "19:01 - 22:10", "22:11 - 01:20", "01:21 - 04:50"
].map(formatTimeSlot);

export const formatTimeSlotEnd = (timeSlot: string) => {
  const [startTime, endTime] = timeSlot.split(' - ');
  
  const parseTimeString = (timeString: string) => {
    return parse(timeString, 'dd/MM/yyyy-HH:mm', new Date());
  };

  const formattedStart = format(parseTimeString(startTime), 'HH:mm');
  const formattedEnd = format(parseTimeString(endTime), 'HH:mm');
  
  return `${formattedStart} - ${formattedEnd}`;
};

export const parseTimeOnline = (timeOnline: string): number => {
  const parts = timeOnline.split(':').map(Number);
  return parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : 0;
};