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
      audioRef.current.load(); // Pre-load the audio
    }
  }, [audioSrc]);

  useEffect(() => {
    localStorage.setItem('audioEnabled', JSON.stringify(audioEnabled));
  }, [audioEnabled]);

  const initializeAudio = useCallback(() => {
    if (audioRef.current && !audioInitialized) {
      const silentAudio = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADQgBtbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1t//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAYAAAAAAAAAQgvm6pPRAAAAAAAAAAAAAAAAAAAA//t8wAAAAAAAlgAAAAAAAAAAAAAAAAAAAAAAAACrJGHvAAAAAAABeZcvAAAAAAAL55vQz8wbO9jY2NjY2djY2H7zH0DYLSLKssM8ERBkzTcNO00TLIcWcILDROkOQERDH7D3H7ABxBBxHCDiAASgAADCgCHBY4fEAmAAB7mQF7GD7zgQgIgGIJiYfIxD/rCCBhxgcZCPwD5bE9DLjDPEhxB8hAQ4L3EcDjBxgAYAmfzIe8HYOQDW5sLt7kQc9kQ6YYZAYICCDnMFR4gAzGBATsYQAzLBMrOZg1TA5GBcSsTCrHfDxDhAOCxTAQMOGCdTA8IDEjBBaDBA7JQFA6IwzOJmWOZBUmM1xjMC0xkKEzMExNIwKCNzAQCzA8JjAwGgJjA0BBADMw4BRzAQCTTvlXZLGzqbOlmm1Dt5vOnjLfUMG7sM+Nq2ZlkWHn/Hg3OhHUgWopRqtjYtTWo02oA40YttQZNQXbM0SbE3C4cKjZXNgAKpASALOAQQVs8k+c79/87+c+/t///vYxm7GYmJGXmJicf85uY/zn");
      silentAudio.play().then(() => {
        setAudioInitialized(true);
        if (audioEnabled) {
          audioRef.current?.play().catch(error => console.error('Error playing audio:', error));
        }
      }).catch(error => console.error('Error initializing audio:', error));
    }
  }, [audioEnabled, audioInitialized]);

  const enableAudio = useCallback(() => {
    setAudioEnabled(true);
    initializeAudio();
  }, [initializeAudio]);

  const playAudio = useCallback(() => {
    if (audioEnabled && audioRef.current) {
      audioRef.current.play().catch((error) => console.error('Error playing audio:', error));
    }
  }, [audioEnabled]);

  return { audioEnabled, enableAudio, playAudio, initializeAudio };
};