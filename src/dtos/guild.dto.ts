export interface GuildMemberDTO {
    name?: string;
    vocation?: string;
    level?: number;
  }
  
  export interface GuildDTO {
    total_online: number;
    members: {
      Sorcerer: GuildMemberDTO[];
      Paladin: GuildMemberDTO[];
      Knight: GuildMemberDTO[];
      Druid: GuildMemberDTO[];
    };
  }
  