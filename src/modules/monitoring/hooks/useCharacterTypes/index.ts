import { useEffect, useState, useCallback, useRef } from 'react'

import { useToast } from '@chakra-ui/react'
import { create } from 'zustand'

import { fixedTypes } from '@/core/constants/types'
import { useStorageStore } from '@/core/store/storage-store'
import type { GuildMemberResponse } from '@/core/types/guild-member.response'
import { useTokenStore } from '@/modules/auth/store/token-decoded-store'
import { upsertPlayer } from '@/modules/statistics/services'

import type { UpsertPlayerInput } from '../../types/character'

// Store for managing custom types
interface CharacterTypesState {
  customTypes: string[]
  setCustomTypes: (types: string[]) => void
  addCustomType: (type: string) => void
}

const useCharacterTypesStore = create<CharacterTypesState>(set => ({
  customTypes: [],
  setCustomTypes: types => set({ customTypes: types }),
  addCustomType: type => set(state => ({ customTypes: [...state.customTypes, type] })),
}))

// Initialize global types set with fixed types
const globalTypesSet = new Set<string>(fixedTypes)

/**
 * Helper function to check if two arrays are equal
 */
const areArraysEqual = (arr1: string[], arr2: string[]): boolean => {
  if (arr1.length !== arr2.length) return false
  return arr1.every((item, index) => item === arr2[index])
}

// Define return types for better TypeScript support
interface CharacterTypesResult {
  types: string[]
  addType: (newType: string) => Promise<void>
}

/**
 * Unified hook for character types management with proper TypeScript overloads
 */
// Overload for simple mode (returns string[])
export function useCharacterTypes(guildData: GuildMemberResponse[], simpleMode: true): string[]
// Overload for full mode (returns object with types and addType)
export function useCharacterTypes(
  guildData: GuildMemberResponse[],
  simpleMode?: false,
): CharacterTypesResult
// Implementation
export function useCharacterTypes(
  guildData: GuildMemberResponse[],
  simpleMode = false,
): string[] | CharacterTypesResult {
  const toast = useToast()
  const { customTypes, addCustomType } = useCharacterTypesStore()
  const { selectedWorld } = useTokenStore()
  const guildId = useStorageStore.getState().getItem('selectedGuildId', '')

  // For tracking previous values to avoid unnecessary updates
  const previousDataRef = useRef<GuildMemberResponse[]>([])
  const previousTypesRef = useRef<string[]>([])
  const [typesState, setTypesState] = useState<string[]>(Array.from(globalTypesSet))

  // Initialize custom types from storage once on mount
  useEffect(() => {
    const storedCustomTypes = useStorageStore.getState().getItem('customTypes', '[]')
    try {
      const parsedTypes = JSON.parse(storedCustomTypes)
      if (Array.isArray(parsedTypes)) {
        useCharacterTypesStore.getState().setCustomTypes(parsedTypes)
      }
    } catch (e) {}
  }, [])

  /**
   * Compute types from fixed types, custom types, and guild data
   */
  const updateTypes = useCallback(() => {
    // Start with fixed types for empty data
    if (!Array.isArray(guildData) || guildData.length === 0) {
      const baseTypes = Array.from(fixedTypes).sort()
      if (!areArraysEqual(baseTypes, previousTypesRef.current)) {
        previousTypesRef.current = baseTypes
        setTypesState(baseTypes)
      }
      return
    }

    // Skip update if data hasn't changed
    if (
      areArraysEqual(
        guildData.map(d => d.Kind),
        previousDataRef.current.map(d => d.Kind),
      )
    ) {
      return
    }

    // Reset global set and add fixed types
    globalTypesSet.clear()
    fixedTypes.forEach(type => globalTypesSet.add(type))

    // Add custom types
    customTypes.forEach(type => globalTypesSet.add(type))

    // Add types from guild data
    guildData.forEach(member => {
      if (member.Kind && member.Kind.trim() !== '') {
        globalTypesSet.add(member.Kind)
      }
    })

    // Sort and update if changed
    const allTypes = Array.from(globalTypesSet).sort()
    if (!areArraysEqual(allTypes, previousTypesRef.current)) {
      previousTypesRef.current = allTypes
      previousDataRef.current = guildData
      setTypesState(allTypes)
    }
  }, [guildData, customTypes])

  // Update types when dependencies change
  useEffect(() => {
    updateTypes()
  }, [updateTypes])

  // API function to add a new type
  const addType = useCallback(
    async (newType: string) => {
      if (!guildId) {
        return
      }

      // Check if type already exists
      if ([...fixedTypes, ...customTypes].includes(newType)) {
        toast({
          title: 'Tipo já existe',
          description: `O tipo "${newType}" já está na lista.`,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      const playerData: UpsertPlayerInput = {
        guild_id: guildId,
        kind: newType,
      }

      try {
        // Save to API
        await upsertPlayer(playerData, selectedWorld)

        // Update local state
        addCustomType(newType)
        useStorageStore.getState().setItem('customTypes', JSON.stringify([...customTypes, newType]))

        toast({
          title: 'Novo tipo adicionado',
          description: `O tipo "${newType}" foi adicionado com sucesso.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } catch (error) {
        toast({
          title: 'Erro ao adicionar tipo',
          description:
            'Ocorreu um erro ao tentar adicionar o novo tipo. Por favor, tente novamente.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    },
    [toast, guildId, customTypes, selectedWorld, addCustomType],
  )

  // Return appropriate interface based on mode with proper type safety
  return simpleMode ? typesState : { types: typesState, addType }
}

/**
 * Simple view-only hook for character types (maintains backward compatibility)
 */
export const useCharacterTypesView = (guildData: GuildMemberResponse[]): string[] => {
  return useCharacterTypes(guildData, true)
}
