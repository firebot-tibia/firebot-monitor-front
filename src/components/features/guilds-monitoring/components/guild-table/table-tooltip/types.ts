import type { GuildMemberResponse } from '@/common/types/guild-member.response'

export interface CharacterTooltipProps {
  member: GuildMemberResponse
  isOpen: boolean
  onToggle: () => void
}
