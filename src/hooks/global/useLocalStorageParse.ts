import { useState, useEffect } from 'react';

type MonitorMode = 'ally' | 'enemy';

export function useLocalStorageMode(key: string, initialValue: MonitorMode): [MonitorMode, (value: MonitorMode) => void] {
  const [storedValue, setStoredValue] = useState<MonitorMode>(initialValue);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key);
        if (item === 'ally' || item === 'enemy') {
          setStoredValue(item);
        } else {
          setStoredValue(initialValue);
        }
      } catch (error) {
        console.error(error);
        setStoredValue(initialValue);
      }
    }
  }, [key, initialValue]);

  const setValue = (value: MonitorMode) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}