export interface GuildMemberDTO {
  name?: string;
  vocation?: string;
  level?: number;
}

export interface GuildDTO {
  guild: {
    total_online: number;
    members: GuildMemberDTO[];
  }
}
