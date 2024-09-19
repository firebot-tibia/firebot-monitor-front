import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useDeaths } from './useDeaths';
import { Death } from '../../shared/interface/death.interface';
import { useEventSource } from '../events/useEvent';

export const useDeathData = () => {
  const [newDeathCount, setNewDeathCount] = useState(0);
  const { deathList, addDeath } = useDeaths();
  const toast = useToast();

  const handleNewDeath = useCallback((newDeath: Death) => {
    setNewDeathCount((prev) => prev + 1);
    addDeath(newDeath);
    toast({
      title: "Nova morte registrada",
      description: `${newDeath.name} morreu.`,
      status: "info",
      duration: 5000,
      isClosable: true,
    });
  }, [addDeath, toast]);

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

  useEventSource(
    'https://api.firebot.run/subscription/enemy/',
    handleMessage
  );

  return {
    newDeathCount,
    deathList,
    handleNewDeath
  };
};