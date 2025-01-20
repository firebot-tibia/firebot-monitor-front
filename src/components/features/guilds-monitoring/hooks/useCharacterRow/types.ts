import type { GuildMemberResponse } from '@/types/guild-member.response'

export interface UseCharacterRowProps {
  member: GuildMemberResponse
  onLocalChange: (member: GuildMemberResponse, newLocal: string) => void
  onClassificationChange: (member: GuildMemberResponse, newClassification: string) => void
}
