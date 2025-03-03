import type { GuildMemberResponse } from '@/core/types/guild-member.response'

export interface CharacterTooltipProps {
  member: GuildMemberResponse
  isOpen: boolean
  onToggle: () => void
}
