import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface StorageState {
  [key: string]: any
  setItem: (key: string, value: any) => void
  getItem: (key: string, defaultValue: any) => any
}

export const useStorageStore = create<StorageState>()(
  persist(
    (set, get) => ({
      setItem: (key, value) => set({ [key]: value }),
      getItem: (key, defaultValue) => get()[key] ?? defaultValue,
    }),
    {
      name: 'storage-store',
    },
  ),
)

export function useStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const { getItem, setItem } = useStorageStore()

  const storedValue = getItem(key, initialValue)

  const setValue = (value: T) => {
    setItem(key, value)
  }

  return [storedValue, setValue]
}
