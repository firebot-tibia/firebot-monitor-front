export interface GuildMember {
  experience: string;
  vocation: string;
  name: string;
  level: number;
  online: boolean;
}

export interface GuildData {
  data: GuildMember[];
  totalPages: number;
  totalExp: number;
  avgExp: number;
}

export interface ExperienceListQuery {
  kind: 'ally' | 'enemy';
  vocation: string;
  name: string;
  sort: string;
  offset: number;
  limit: number;
}

export interface ExperienceListResponse {
  exp_list: {
    players: any[];
    Count: {
      records: number;
    };
    total_exp_yesterday: number;
    total_exp_7_days: number;
    total_exp_30_days: number;
  }
}