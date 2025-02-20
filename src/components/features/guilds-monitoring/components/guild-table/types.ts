import type { GuildMemberResponse } from '@/common/types/guild-member.response'

export interface GuildTableProps {
  type: string
  data: GuildMemberResponse[]
  onlineCount: number
  onLocalChange: (member: GuildMemberResponse, newLocal: string) => Promise<void>
  onClassificationChange: (member: GuildMemberResponse, newClassification: string) => Promise<void>
  showExivaInput: boolean
  types: string[]
  addType: (type: string) => void
  isLoading: boolean
}
