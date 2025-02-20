import { create } from 'zustand'

export const useStorage = (key: string, defaultValue: any) => [defaultValue, jest.fn()]

export const useStorageStore = create(() => ({
  getItem: (key: string, defaultValue: any) => defaultValue,
  setItem: jest.fn(),
  removeItem: jest.fn(),
}))
