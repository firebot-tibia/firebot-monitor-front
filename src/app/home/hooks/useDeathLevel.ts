import { useCallback, useEffect } from 'react';
import { useEventSource } from '../../../shared/hooks/useEvent';
import { Death } from '../../../shared/interface/death.interface';
import { Level } from '../../../shared/interface/level.interface';
import { useGlobalStore } from '../../../store/death-level-store';

export const useDeathData = (mode: 'ally' | 'enemy') => {
  const {
    deathList,
    levelUpList,
    levelDownList,
    newDeathCount,
    newLevelUpCount,
    newLevelDownCount,
    addDeath,
    addLevelUp,
    addLevelDown,
    resetNewCounts,
  } = useGlobalStore();

  const handleNewDeath = useCallback((newDeath: Death) => {
    addDeath(newDeath);
  }, [addDeath]);

  const handleNewLevel = useCallback((levelData: any) => {
    const newLevel: Level = {
      character: levelData.player,
      oldLevel: levelData.old_level,
      newLevel: levelData.new_level,
      date: new Date(),
    };

    if (newLevel.newLevel > newLevel.oldLevel) {
      addLevelUp(newLevel);
    } else {
      addLevelDown(newLevel);
    }
  }, [addLevelUp, addLevelDown]);

  const handleMessage = useCallback((data: any) => {
    if (data?.death) {
      const newDeath: Death = {
        ...data.death,
        date: new Date(data.death.date || Date.now()),
        death: data.death.text,
      };
      handleNewDeath(newDeath);
    }
    if (data?.level) {
      handleNewLevel(data.level);
    }
  }, [handleNewDeath, handleNewLevel]);

  const { error } = useEventSource(
    `https://api.firebot.run/subscription/${mode}/`,
    handleMessage
  );

  useEffect(() => {
    resetNewCounts();
  }, [mode, resetNewCounts]);

  return {
    newDeathCount,
    newLevelUpCount,
    newLevelDownCount,
    deathList,
    levelUpList,
    levelDownList,
    error
  };
};