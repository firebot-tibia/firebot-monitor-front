import type { GuildMemberResponse } from '@/common/types/guild-member.response'

export type SortableFields = 'Name' | 'Level' | 'Kind' | 'TimeOnline' | 'Vocation'

export interface SortConfig {
  key: keyof GuildMemberResponse
  direction: 'asc' | 'desc'
}
