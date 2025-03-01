import type { GuildMember } from '@/common/types/guild-member'

export interface GuildData {
  data: GuildMember[]
  totalPages: number
  totalExp: number
  avgExp: number
}

export interface ExperienceListQuery {
  kind: 'ally' | 'enemy'
  world: string
  vocation: string
  name: string
  sort: string
  offset: number
  limit?: number
}

export interface ExperienceListResponse {
  exp_list: {
    players: any[]
    Count: {
      pages: number
      records: number
    }
    total_exp_yesterday: number
    total_exp_7_days: number
    total_exp_30_days: number
    players_with_negative_exp_7_days: number
    players_with_negative_exp_30_days: number
    players_with_negative_exp_yesterday: number
    players_with_positive_exp_7_days: number
    players_with_positive_exp_30_days: number
    players_with_positive_exp_yesterday: number
  }
}
