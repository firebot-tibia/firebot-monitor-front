import type { GuildMember } from '@/core/types/guild-member'

export interface GuildMemberStats {
  name: string
  vocation: string
  level: number
  experience: number
}

export interface GuildData {
  data: GuildMemberStats[]
  totalPages: number
  totalExp: number
  avgExp: number
  page: number
}

export interface GuildGroupData {
  gain: GuildData
  loss: GuildData
}

export interface GuildStatsData {
  ally: GuildGroupData
  enemy: GuildGroupData
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
