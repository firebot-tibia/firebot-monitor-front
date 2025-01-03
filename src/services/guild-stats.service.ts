import { ExperienceListQuery } from '../components/guild/guild-stats/interfaces/guild-stats.interface'
import { UpsertPlayerInput } from '../types/interfaces/character-upsert.interface'
import api from './api/firebot-api'

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
    const decodedCharacter = decodeURIComponent(query.character)
    const response = await api.get(`/gamedata/online-time`, {
      params: { character: decodedCharacter },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const getPlayersLifeTimeDeaths = async (query: { character: string }) => {
  try {
    const decodedCharacter = decodeURIComponent(query.character)
    const response = await api.get(`/gamedata/players/deaths`, {
      params: { character: decodedCharacter },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const getPlayerExperienceHistory = async (query: { character: string }) => {
  try {
    const decodedCharacter = decodeURIComponent(query.character)
    const response = await api.get(`/gamedata/players/experience-history`, {
      params: { character: decodedCharacter },
    })
    return response.data
  } catch (error) {
    throw error
  }
}
