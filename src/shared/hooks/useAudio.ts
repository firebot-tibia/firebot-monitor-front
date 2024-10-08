import { useState, useCallback, useRef, useEffect } from 'react';

export interface AudioControl {
  audioEnabled: boolean;
  toggleAudio: () => void;
  enableAudio: () => void;
  playAudio: () => void;
  initializeAudio: () => void;
  markUserInteraction: () => void;
}

export const useAudio = (audioSources: string | string[]): AudioControl | AudioControl[] => {
  const sources = Array.isArray(audioSources) ? audioSources : [audioSources];
  
  const [audioStates, setAudioStates] = useState<boolean[]>(() =>
    sources.map((_, index) => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(`audioEnabled_${index}`);
        return saved !== null ? JSON.parse(saved) : false;
      }
      return false;
    })
  );

  const [audioInitialized, setAudioInitialized] = useState<boolean[]>(sources.map(() => false));
  const audioRefs = useRef<(HTMLAudioElement | null)[]>(sources.map(() => null));
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sources.forEach((src, index) => {
        if (!audioRefs.current[index]) {
          audioRefs.current[index] = new Audio(src);
          audioRefs.current[index]!.preload = 'auto';
        }
      });
    }
  }, [sources]);

  useEffect(() => {
    audioStates.forEach((state, index) => {
      localStorage.setItem(`audioEnabled_${index}`, JSON.stringify(state));
    });
  }, [audioStates]);

  const initializeAudio = useCallback((index: number) => {
    if (audioRefs.current[index] && !audioInitialized[index]) {
      audioRefs.current[index]!.load();
      setAudioInitialized(prev => {
        const newState = [...prev];
        newState[index] = true;
        return newState;
      });
    }
  }, [audioInitialized]);

  const toggleAudio = useCallback((index: number) => {
    setAudioStates(prev => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
    initializeAudio(index);
  }, [initializeAudio]);

  const enableAudio = useCallback((index: number) => {
    setAudioStates(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
    initializeAudio(index);
  }, [initializeAudio]);

  const markUserInteraction = useCallback(() => {
    setUserInteracted(true);
  }, []);

  const playAudio = useCallback((index: number) => {
    if (audioStates[index] && audioRefs.current[index] && userInteracted) {
      audioRefs.current[index]!.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    } else if (!userInteracted) {
      console.log('Waiting for user interaction before playing audio.');
    }
  }, [audioStates, userInteracted]);

  const audioControls: AudioControl[] = sources.map((_, index) => ({
    audioEnabled: audioStates[index],
    toggleAudio: () => toggleAudio(index),
    enableAudio: () => enableAudio(index),
    playAudio: () => playAudio(index),
    initializeAudio: () => initializeAudio(index),
    markUserInteraction,
  }));

  return Array.isArray(audioSources) ? audioControls : audioControls[0];
};