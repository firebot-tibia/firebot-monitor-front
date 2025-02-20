import api from '../../../../common/libs/api/firebot-api'
import type { CreateReservationData } from '../types/reservations.interface'

export const getReservationsList = async (query: {
  guild_id: string
  status?: 'reserved' | 'canceled' | 'free'
  start_time_greater?: string
  start_time_less?: string
  end_time_greater?: string
  end_time_less?: string
  kind?: 'ally' | 'enemy'
  world?: string
}): Promise<any> => {
  try {
    const response = await api.get('/reservations/list', {
      params: query,
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const getAllRespawnsPremiums = async () => {
  try {
    const response = await api.get(`/respawns/list-premium`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getAllRespawns = async () => {
  try {
    const response = await api.get(`/respawns/list-all`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const createReservation = async (
  reservationData: Omit<CreateReservationData, 'world'>,
  world: string,
) => {
  try {
    const response = await api.post(
      `/reservations/create?world=${encodeURIComponent(world)}`,
      reservationData,
    )
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteReservation = async (id: string, world: string) => {
  try {
    const response = await api.delete(`/reservations/${id}?world=${encodeURIComponent(world)}`, {
      params: { kind: 'ally' },
    })
    return response.data
  } catch (error) {
    throw error
  }
}
