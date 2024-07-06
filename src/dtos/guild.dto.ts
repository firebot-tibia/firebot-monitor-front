export interface GuildMemberDTO {
  name?: string;
  vocation?: string;
  level?: number;
  onlineTimer?:any;
}

export interface GuildDTO {
  guild: {
    total_online: number;
    members: GuildMemberDTO[];
  }
}
