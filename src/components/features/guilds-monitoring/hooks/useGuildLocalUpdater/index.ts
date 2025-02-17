import { useCallback } from 'react'

import { usePermission } from '@/hooks/usePermission'

import { upsertPlayer } from '../../../../../services/guild-stats'
import { useStorageStore } from '../../../../../stores/storage-store'
import { useTokenStore } from '../../../../../stores/token-decoded-store'
import type { GuildMemberResponse } from '../../../../../types/guild-member.response'

interface UseGuildLocalUpdaterReturn {
  handleLocalChange: (member: GuildMemberResponse, newLocal: string) => Promise<void>
}

export const useGuildLocalUpdater = (
  updateMemberData: (member: GuildMemberResponse, changes: Partial<GuildMemberResponse>) => void,
): UseGuildLocalUpdaterReturn => {
  const checkPermission = usePermission()
  const guildId = useStorageStore.getState().getItem('selectedGuildId', '')
  const { selectedWorld } = useTokenStore()

  const handleLocalChange = useCallback(
    async (member: GuildMemberResponse, newLocal: string) => {
      if (!checkPermission()) return
      if (!guildId) return

      try {
        const playerData = {
          guild_id: guildId,
          kind: member.Kind,
          name: member.Name,
          status: member.Status,
          local: newLocal,
        }

        await upsertPlayer(playerData, selectedWorld)
        updateMemberData(member, { Local: newLocal })
      } catch (error) {
        throw error
      }
    },
    [checkPermission, guildId, selectedWorld, updateMemberData],
  )

  return { handleLocalChange }
}
