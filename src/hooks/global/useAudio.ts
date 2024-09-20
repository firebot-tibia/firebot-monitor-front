import { useState, useCallback, useRef, useEffect } from 'react';

export const useAudio = (audioSrc: string) => {
  const [audioEnabled, setAudioEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('audioEnabled');
      return saved !== null ? JSON.parse(saved) : false;
    }
    return false;
  });
  const [audioInitialized, setAudioInitialized] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio(audioSrc);
      audioRef.current.preload = 'auto';
    }
  }, [audioSrc]);

  useEffect(() => {
    localStorage.setItem('audioEnabled', JSON.stringify(audioEnabled));
  }, [audioEnabled]);

  const initializeAudio = useCallback(() => {
    if (audioRef.current && !audioInitialized) {
      audioRef.current.load();
      setAudioInitialized(true);
    }
  }, [audioInitialized]);

  const enableAudio = useCallback(() => {
    setAudioEnabled(true);
    initializeAudio();
  }, [initializeAudio]);

  const playAudio = useCallback(() => {
    if (audioEnabled && audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error('Error playing audio:', error);
        if (error.name === 'NotAllowedError') {
          console.log('Audio autoplay blocked. Waiting for user interaction.');
        }
      });
    }
  }, [audioEnabled]);

  return { audioEnabled, enableAudio, playAudio, initializeAudio };
};