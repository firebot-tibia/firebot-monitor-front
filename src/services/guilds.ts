import { api } from './api'

export const getEnemyGuild = async () => {
  return api.get('/guilds')
}
