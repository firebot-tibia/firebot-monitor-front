import { useState, useEffect, useRef, useCallback } from 'react';
import { Level } from "../../../shared/interface/level.interface";

const ITEMS_PER_PAGE = 50;

export const useLevelTable = (levelList: Level[], playAudio: () => void, audioEnabled: boolean) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [newLevelUpCount, setNewLevelUpCount] = useState(0);
  const [newLevelDownCount, setNewLevelDownCount] = useState(0);
  const previousLevelListLength = useRef(levelList.length);

  const levelUps = levelList.filter(level => level.new_level > level.old_level);
  const levelDowns = levelList.filter(level => level.new_level < level.old_level);

  const totalLevelUpPages = Math.max(1, Math.ceil(levelUps.length / ITEMS_PER_PAGE));
  const totalLevelDownPages = Math.max(1, Math.ceil(levelDowns.length / ITEMS_PER_PAGE));

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  useEffect(() => {
    if (levelList.length > previousLevelListLength.current) {
      const newLevels = levelList.slice(previousLevelListLength.current);
      const newLevelUpsCount = newLevels.filter(level => level.new_level > level.old_level).length;
      const newLevelDownsCount = newLevels.filter(level => level.new_level < level.old_level).length;
      
      setNewLevelUpCount((prevCount) => prevCount + newLevelUpsCount);
      setNewLevelDownCount((prevCount) => prevCount + newLevelDownsCount);
      
      if (audioEnabled && (newLevelUpsCount > 0 || newLevelDownsCount > 0)) {
        playAudio();
      }
    }
    previousLevelListLength.current = levelList.length;
  }, [levelList, audioEnabled, playAudio]);

  const getCurrentPageData = useCallback((levels: Level[]) => {
    return levels.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [currentPage]);

  return {
    currentPage,
    newLevelUpCount,
    newLevelDownCount,
    levelUps,
    levelDowns,
    totalLevelUpPages,
    totalLevelDownPages,
    handlePageChange,
    getCurrentPageData,
  };
};