import type { GuildMemberResponse } from '@/core/types/guild-member.response'

export interface CharacterRowProps {
  member: GuildMemberResponse
  onLocalChange: (member: GuildMemberResponse, newLocal: string) => void
  onClassificationChange: (member: GuildMemberResponse, newClassification: string) => Promise<void>
  showExivaInput: boolean
  index: number
  types: string[]
  addType: (type: string) => void
}
