import { useState, useCallback, useEffect, useRef } from 'react';
import { Death } from '../interface/death.interface';

export const useDeaths = () => {
  const [deathList, setDeathList] = useState<Death[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('deathList');
      if (saved !== null) {
        try {
          const parsedList = JSON.parse(saved);
          return parsedList.map((death: Death) => ({
            ...death,
            date: death.date ? new Date(death.date) : undefined
          }));
        } catch (error) {
          console.error('Error parsing deathList from localStorage:', error);
          return [];
        }
      }
    }
    return [];
  });

  const initialRender = useRef(true);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
    } else {
      localStorage.setItem('deathList', JSON.stringify(deathList));
    }
  }, [deathList]);

  const addDeath = useCallback((newDeath: Death) => {
    setDeathList(prevList => {
      const twentyfourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const filteredList = prevList.filter(death => {
        if (death.date) {
          return new Date(death.date) > twentyfourHoursAgo;
        }
        return true;
      });

      const deathDate = newDeath.date ? new Date(newDeath.date) : new Date();
      const uniqueId = `${newDeath.name}-${deathDate.getTime()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const updatedDeath = { ...newDeath, id: uniqueId, date: deathDate };

      const deathExists = filteredList.some(death => 
        death.name === updatedDeath.name &&
        death.level === updatedDeath.level &&
        death.vocation === updatedDeath.vocation &&
        death.city === updatedDeath.city &&
        death.death === updatedDeath.death &&
        death.date?.getTime() === updatedDeath.date.getTime()
      );

      if (deathExists) {
        return filteredList;
      }

      return [updatedDeath, ...filteredList];
    });
  }, []);

  const clearDeaths = useCallback(() => {
    setDeathList([]);
    localStorage.removeItem('deathList');
  }, []);

  return { deathList, addDeath, clearDeaths };
};