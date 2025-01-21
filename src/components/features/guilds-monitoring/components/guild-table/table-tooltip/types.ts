import type { GuildMemberResponse } from '@/types/guild-member.response'

export interface CharacterTooltipProps {
  member: GuildMemberResponse
  isOpen: boolean
  onToggle: () => void
}
