import { useState, useCallback, useRef, useEffect } from 'react';

export const useAudio = (audioSrc: string) => {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio(audioSrc);
    }
  }, [audioSrc]);

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