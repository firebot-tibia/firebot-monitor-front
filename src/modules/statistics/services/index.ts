import api from '../../../core/api/firebot-api'
import type { UpsertPlayerInput } from '../../monitoring/types/character'
import type { ExperienceListQuery } from '../types/guild-stats.interface'

export const upsertPlayer = async (playerData: UpsertPlayerInput, world: string) => {
  try {
    const response = await api.post(
      `/gamedata/insert-player-editor?world=${encodeURIComponent(world)}`,
      playerData,
    )
    return response.data
  } catch (error) {
    throw error
  }
}

export const getExperienceList = async (query: ExperienceListQuery) => {
  try {
    const response = await api.get(`/gamedata/experience-list`, {
      params: query,
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const getPlayerOnlineHistory = async (query: { character: string }) => {
  try {
    const url = `/gamedata/online-time?character=${encodeURIComponent(query.character.replace(/\+/g, ' '))}`
    const response = await api.get(url, {})
    return response.data
  } catch (error) {
    throw error
  }
}

export const getPlayersLifeTimeDeaths = async (query: { character: string }) => {
  try {
    const url = `/gamedata/players/deaths?character=${encodeURIComponent(query.character.replace(/\+/g, ' '))}`
    const response = await api.get(url, {})
    return response.data
  } catch (error) {
    throw error
  }
}

export const getPlayerExperienceHistory = async (query: { character: string }) => {
  try {
    // Create a manually encoded URL with spaces as %20
    const url = `/gamedata/players/experience-history?character=${encodeURIComponent(query.character.replace(/\+/g, ' '))}`
    const response = await api.get(url, {})
    return response.data
  } catch (error) {
    throw error
  }
}
