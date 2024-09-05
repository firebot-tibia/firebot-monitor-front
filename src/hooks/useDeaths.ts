import { useState, useCallback } from 'react';
import { Death } from '../shared/interface/death.interface';

export const useDeaths = () => {
  const [deathList, setDeathList] = useState<Death[]>([]);

  const addDeath = useCallback((newDeath: Death) => {
    setDeathList(prevList => [newDeath, ...prevList]);
  }, []);

  useCallback(() => {
    setTimeout(() => {
      setDeathList([]);
    }, 1000);
  }, []);

  return { deathList, addDeath };
};
