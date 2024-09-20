import { useCallback } from "react";

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