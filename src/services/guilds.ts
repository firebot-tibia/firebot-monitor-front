import { api } from "./api";

export const getEnemyGuild = async () => {
  return api.get('/dashboard/guilds');
};

