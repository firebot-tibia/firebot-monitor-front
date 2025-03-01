import type { GuildMemberResponse } from '@/types/guild-member.response'

export interface CharacterClassificationProps {
  member: GuildMemberResponse
  types: string[]
  onClassificationChange: (member: GuildMemberResponse, newClassification: string) => Promise<void>
  addType: (type: string) => void
}
