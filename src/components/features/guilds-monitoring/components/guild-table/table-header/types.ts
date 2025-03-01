import type { GuildMemberResponse } from '@/common/types/guild-member.response'

import type { SortConfig } from '../index'

export interface TableHeaderProps {
  sortConfig: SortConfig
  onSort: (key: keyof GuildMemberResponse) => void
  showExivaInput: boolean
}
