import type { GuildMemberResponse } from '@/core/types/guild-member.response'

import type { SortConfig } from '../guild-table/index'

export interface TableHeaderProps {
  sortConfig: SortConfig
  onSort: (key: keyof GuildMemberResponse) => void
  showExivaInput: boolean
}
