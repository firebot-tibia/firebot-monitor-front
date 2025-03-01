import { useCallback, useMemo } from 'react'

import { useToast } from '@chakra-ui/react'
import { create } from 'zustand'

import type { UpsertPlayerInput } from './types'
import { fixedTypes } from '../../../../../common/constants/types'
import { useStorageStore } from '../../../../../common/stores/storage-store'
import type { GuildMemberResponse } from '../../../../../common/types/guild-member.response'
import { useTokenStore } from '../../../auth/store/token-decoded-store'
import { upsertPlayer } from '../../../statistics/services'

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

export const useCharacterTypes = (guildData: GuildMemberResponse[]) => {
  const toast = useToast()
  const { customTypes, addCustomType } = useCharacterTypesStore()
  const { selectedWorld } = useTokenStore()
  const guildId = useStorageStore.getState().getItem('selectedGuildId', '')

  const types = useMemo(() => {
    // Always start with fixed types
    const typeSet = new Set(fixedTypes)

    // Add custom types
    customTypes.forEach(type => typeSet.add(type))

    // Add types from guild data
    if (Array.isArray(guildData) && guildData.length > 0) {
      guildData.forEach(member => {
        if (member.Kind && member.Kind.trim() !== '') {
          typeSet.add(member.Kind)
        }
      })
    }
    return Array.from(typeSet)
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
