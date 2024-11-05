import { useToast } from "@chakra-ui/react";
import { GuildMemberResponse } from "../interface/guild/guild-member.interface";
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


  export const getTimeColor = (timeOnline: string | null): string => {
    try {
      if (!timeOnline) return 'red.500';

      const [hours, minutes] = timeOnline.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes;

      if (totalMinutes <= 5) return 'red.500';
      if (totalMinutes <= 15) return 'orange.500';
      if (totalMinutes <= 30) return 'yellow.500';
      return 'inherit';
    } catch (error) {
      console.error('Error in getTimeColor:', error);
      return 'red.500';
    }
  };

export const clearLocalStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      const currentDomain = window.location.hostname;
      if (currentDomain === 'localhost' || currentDomain === 'monitor.firebot.run') {
        localStorage.removeItem('deathList');
        localStorage.removeItem('levelUpList');
        localStorage.removeItem('levelDownList');
      }
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

export const copyExivas = (data: GuildMemberResponse, toast: ReturnType<typeof useToast>) => {
  const cleanName = data.Name.trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\x20-\x7E]/g, '');
  const exivas = `exiva "${cleanName}"`;
  navigator.clipboard.writeText(exivas);
  toast({
    title: 'Exiva copiado para a área de transferência.',
    status: 'success',
    duration: 2000,
    isClosable: true,
  });
};

export const formatTimeSlot = (timeString: string): string => {
  const [start, end] = timeString.split(' - ');
  const currentDate = new Date();
  const startDate = new Date(currentDate.setHours(parseInt(start.split(':')[0]), parseInt(start.split(':')[1])));
  const endDate = new Date(currentDate.setHours(parseInt(end.split(':')[0]), parseInt(end.split(':')[1])));

  return `${format(startDate, 'dd/MM/yyyy-HH:mm')} - ${format(endDate, 'dd/MM/yyyy-HH:mm')}`;
};

export const defaultTimeSlots = [
  "05:30 - 09:00", "09:01 - 12:30", "12:31 - 16:00", "16:01 - 19:30",
  "19:31 - 23:00", "23:01 - 02:30", "02:31 - 05:00"
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

export const formatTimeOnline = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.floor(minutes % 60);
  const seconds = Math.floor((minutes % 1) * 60);
  return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const parseTimeOnline = (timeOnline: string): number => {
  const parts = timeOnline.split(':').map(Number);
  return parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : 0;
};

export const convertFrontEndDateToISO = (frontEndDate: string): string => {
  const [datePart, timePart] = frontEndDate.split('-');
  const [day, month, year] = datePart.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}:00Z`;
};


export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const formatDateForAPI = (date: Date): string => {
  return format(date, 'dd/MM/yyyy-HH:mm');
};

export  const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const gmt3Date = new Date(date.getTime() - (3 * 60 * 60 * 1000));
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC'
  };

  return new Intl.DateTimeFormat('pt-BR', options).format(gmt3Date);
};