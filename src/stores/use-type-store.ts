import { useCallback, useMemo } from 'react'
import { useToast } from '@chakra-ui/react'
import { create } from 'zustand'
import { useStorageStore } from './storage-store'
import { useTokenStore } from './token-decoded-store'

import { UpsertPlayerInput } from '../types/interfaces/character-upsert.interface'
import { GuildMemberResponse } from '../types/interfaces/guild/guild-member.interface'
import { upsertPlayer } from '../services/guild-stats.service'
import { fixedTypes } from '../constants/types'

interface CharacterTypesState {
  customTypes: string[]
  setCustomTypes: (types: string[]) => void
  addCustomType: (type: string) => void
}

const useCharacterTypesStore = create<CharacterTypesState>((set) => ({
  customTypes: [],
  setCustomTypes: (types) => set({ customTypes: types }),
  addCustomType: (type) => set((state) => ({ customTypes: [...state.customTypes, type] })),
}))

export const useCharacterTypes = (guildData: GuildMemberResponse[]) => {
  const toast = useToast()
  const { customTypes, addCustomType } = useCharacterTypesStore()
  const { selectedWorld } = useTokenStore()
  const guildId = useStorageStore.getState().getItem('selectedGuildId', '')

  const types = useMemo(() => {
    if (Array.isArray(guildData) && guildData.length > 0) {
      const allTypes = guildData.map((member) => member.Kind)
      const uniqueTypes = Array.from(new Set(allTypes.filter((type) => type && type.trim() !== '')))
      return Array.from(new Set([...fixedTypes, ...customTypes, ...uniqueTypes]))
    }
    return [...fixedTypes, ...customTypes]
  }, [guildData, customTypes])

  const addType = useCallback(
    async (newType: string) => {
      if (!guildId) {
        return
      }

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
        await upsertPlayer(playerData, selectedWorld)

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
        console.error('Erro ao adicionar novo tipo:', error)
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

  return { types, addType }
}
