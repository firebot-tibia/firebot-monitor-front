import type { GuildMemberResponse } from '@/common/types/guild-member.response'

export interface ExivaInputProps {
  member: GuildMemberResponse
  onLocalChange: (member: GuildMemberResponse, newLocal: string) => void
  fontSize: string
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}
