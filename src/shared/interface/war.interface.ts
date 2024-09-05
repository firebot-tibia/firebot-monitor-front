export type WarStatus = 'Dominado' | 'Em Guerra' | 'Sofrendo ataques';

export interface WorldData {
  world: string;
  status: WarStatus;
  dominantGuild: string;
  enemyGuild: string | null;
  playersOnline: number;
  totalPlayersDominated: number;
  totalPlayersEnemy: number;
  alliance: string;
}