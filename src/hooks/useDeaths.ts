import { useState, useCallback, useEffect } from 'react';
import { Death } from '../shared/interface/death.interface';

export const useDeaths = () => {
  const [deathList, setDeathList] = useState<Death[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('deathList');
      return saved !== null ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('deathList', JSON.stringify(deathList));
  }, [deathList]);

  const addDeath = useCallback((newDeath: Death) => {
    setDeathList(prevList => {
      const updatedList = [newDeath, ...prevList];
      const twelveHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return updatedList.filter(death => {
        if (death.date) {
          return new Date(death.date) > twelveHoursAgo;
        }
        return true;
      });
    });
  }, []);

  return { deathList, addDeath };
};