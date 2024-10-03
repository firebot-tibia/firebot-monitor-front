import { useState, useCallback, useEffect } from 'react';
import { Death } from '../../shared/interface/death.interface';
import { useEventSource } from './useEvent';
import { useDeaths } from '../../shared/hooks/useDeaths';


export const useDeathData = (mode: 'ally' | 'enemy') => {
  const [newDeathCount, setNewDeathCount] = useState(0);
  const { deathList, addDeath } = useDeaths();

  const handleNewDeath = useCallback((newDeath: Death) => {
    setNewDeathCount((prev) => prev + 1);
    addDeath(newDeath);
  }, [addDeath]);

  const handleMessage = useCallback((data: any) => {
    if (data?.death) {
      const newDeath: Death = {
        ...data.death,
        date: new Date(data.death.date || Date.now()),
        death: data.death.text,
      };
      handleNewDeath(newDeath);
    }
  }, [handleNewDeath]);

  const { error } = useEventSource(
    `https://api.firebot.run/subscription/${mode}/`,
    handleMessage
  );

  useEffect(() => {
    setNewDeathCount(0);
  }, [mode]);

  return {
    newDeathCount,
    deathList,
    handleNewDeath,
    error
  };
};