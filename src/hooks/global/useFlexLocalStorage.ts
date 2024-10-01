import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

type SetValueFunction<T> = (value: T | ((prev: T) => T)) => void;

export function useFlexibleLocalStorage<T>(key: string, initialValue: T): [T, SetValueFunction<T>] {
  const [localStorageValue, setLocalStorageValue] = useLocalStorage<T>(key, initialValue);
  const [stateValue, setStateValue] = useState<T>(localStorageValue);

  useEffect(() => {
    setLocalStorageValue(stateValue);
  }, [stateValue, setLocalStorageValue]);

  const setStoredValue = useCallback((value: T | ((prev: T) => T)) => {
    setStateValue(prev => 
      typeof value === 'function'
        ? (value as (prev: T) => T)(prev)
        : value
    );
  }, []);

  return [stateValue, setStoredValue];
}