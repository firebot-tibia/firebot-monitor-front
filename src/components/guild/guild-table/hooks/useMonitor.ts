import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@chakra-ui/react';
import { useFlexibleLocalStorage } from '../../../../shared/hooks/useFlexLocalStorage';
import { GuildMemberResponse } from '../../../../shared/interface/guild/guild-member.interface';
import { parseTimeOnline } from '../../../../shared/utils/utils';

export const useCharacterMonitoring = (characters: GuildMemberResponse[], types: string[]) => {
  const [threshold, setThreshold] = useFlexibleLocalStorage<number>('character-threshold', 5);
  const [timeWindow, setTimeWindow] = useFlexibleLocalStorage<number>('character-timeWindow', 120);
  const [monitoredLists, setMonitoredLists] = useFlexibleLocalStorage<string[]>('monitored-lists', ['bomba', 'maker']);
  const toast = useToast();
  const lastAlertTimeRef = useRef<number>(0);

  const checkThreshold = useCallback(() => {
    const now = Date.now();
    if (now - lastAlertTimeRef.current < 60000) return;

    const filteredCharacters = characters.filter(char => monitoredLists.includes(char.Kind));
    const recentCharacters = filteredCharacters.filter(char => 
      char.OnlineStatus && parseTimeOnline(char.TimeOnline) <= timeWindow
    );
    
    const totalRecentCount = recentCharacters.length;

    if (totalRecentCount >= threshold) {
      lastAlertTimeRef.current = now;
      const recentCounts = monitoredLists.reduce((acc, list) => {
        acc[list] = recentCharacters.filter(char => char.Kind === list).length;
        return acc;
      }, {} as Record<string, number>);

      const msg = `Alerta! Total de ${totalRecentCount} personagens logaram nos últimos ${timeWindow} segundos! Detalhes: ${
        Object.entries(recentCounts)
          .filter(([_, count]) => count > 0)
          .map(([type, count]) => `${count} ${type}`)
          .join(', ')
      }`;

      toast({
        title: 'Alerta de Personagens!',
        description: msg,
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(msg);
        utterance.lang = 'pt-BR';
        utterance.voice = speechSynthesis.getVoices().find(voice => voice.lang === 'pt-BR') || null;
        speechSynthesis.speak(utterance);
      }
    }
  }, [characters, threshold, timeWindow, toast, monitoredLists]);

  useEffect(() => {
    const timer = setInterval(checkThreshold, 10000);
    return () => clearInterval(timer);
  }, [checkThreshold]);

  useEffect(() => {
    setMonitoredLists(prev => prev.filter(type => types.includes(type)));
  }, [types, setMonitoredLists]);

  const handleCheckboxChange = useCallback((type: string, isChecked: boolean) => {
    setMonitoredLists(prev => 
      isChecked 
        ? [...prev, type]
        : prev.filter(t => t !== type)
    );
  }, [setMonitoredLists]);

  return {
    threshold,
    setThreshold,
    timeWindow,
    setTimeWindow,
    monitoredLists,
    handleCheckboxChange
  };
};