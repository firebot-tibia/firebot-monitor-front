import { useState, useCallback, useRef, useEffect } from 'react';

export const useAudio = (audioSrc: string) => {
  const [audioEnabled, setAudioEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('audioEnabled');
      return saved !== null ? JSON.parse(saved) : false;
    }
    return false;
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio(audioSrc);
    }
  }, [audioSrc]);

  useEffect(() => {
    localStorage.setItem('audioEnabled', JSON.stringify(audioEnabled));
  }, [audioEnabled]);

  const enableAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => setAudioEnabled(true))
        .catch((error) => console.error('Error enabling audio:', error));
    }
  }, []);

  const playAudio = useCallback(() => {
    if (audioEnabled && audioRef.current) {
      audioRef.current.play().catch((error) => console.error('Error playing audio:', error));
    }
  }, [audioEnabled]);

  return { audioEnabled, enableAudio, playAudio };
};