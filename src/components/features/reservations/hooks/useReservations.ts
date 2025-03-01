import { useState, useEffect, useCallback } from 'react'

import { useToast, useDisclosure } from '@chakra-ui/react'
import { endOfDay, format, lastDayOfMonth, startOfDay } from 'date-fns'

import { defaultRespawns } from '@/common/constants/default-respawns'
import { usePermission } from '@/common/hooks/usePermission'
import { useStorageStore } from '@/common/stores/storage-store'
import { defaultTimeSlots } from '@/common/utils/format-time-slot'
import { useTokenStore } from '@/components/features/auth/store/token-decoded-store'
import {
  getReservationsList,
  getAllRespawnsPremiums,
  createReservation,
  deleteReservation,
} from '@/components/features/reservations/services'

import type { Reservation, Respawn, CreateReservationData } from '../types/reservations.interface'

export const useReservationsManager = () => {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [timeSlots] = useState(defaultTimeSlots)
  const [respawns, setRespawns] = useState<Respawn[]>([])
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null)
  const toast = useToast()
  const checkPermission = usePermission()
  const {
    isOpen: isManagementModalOpen,
    onOpen: onManagementModalOpen,
    onClose: onManagementModalClose,
  } = useDisclosure()
  const {
    isOpen: isDeleteModalOpen,
    onOpen: openDeleteModal,
    onClose: closeDeleteModal,
  } = useDisclosure()
  const { selectedWorld } = useTokenStore()

  const fetchReservations = useCallback(async () => {
    const now = new Date()
    const firstDayOfMonth = format(startOfDay(now), 'dd/MM/yyyy-HH:mm')
    const lastDayOfCurrentMonth = format(endOfDay(lastDayOfMonth(now)), 'dd/MM/yyyy-HH:mm')

    try {
      const guildId = useStorageStore.getState().getItem('selectedGuildId', '')
      if (!guildId) {
        return
      }
      const response = await getReservationsList({
        guild_id: guildId,
        start_time_greater: firstDayOfMonth,
        end_time_less: lastDayOfCurrentMonth,
        kind: 'ally',
        world: selectedWorld,
      })
      setReservations(response)
    } catch (error) {
      throw error
    }
  }, [selectedWorld])

  const fetchRespawns = useCallback(async () => {
    try {
      const respawnsData = await getAllRespawnsPremiums()
      const respawnsWithImages = respawnsData.map((respawn: Respawn) => ({
        ...respawn,
        image:
          respawn.image || defaultRespawns.find(r => r.name === respawn.name)?.image || 'deer.gif',
      }))
      setRespawns(respawnsWithImages)
    } catch (error) {
      throw error
    }
  }, [])

  const handleAddReservation = useCallback(
    async (data: Omit<CreateReservationData, 'world'> & { respawn_id: string }) => {
      if (!checkPermission()) return
      try {
        await createReservation(
          {
            start_time: data.start_time,
            end_time: data.end_time,
            reserved_for: data.reserved_for,
            respawn_id: data.respawn_id,
            kind: 'ally',
          },
          selectedWorld,
        )
        await fetchReservations()
      } catch (error) {
        toast({
          title: 'Esse respawn já está reservado',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        throw error
      }
    },
    [checkPermission, toast, selectedWorld, fetchReservations],
  )

  const handleDeleteReservation = useCallback(
    (reservation: Reservation) => {
      setReservationToDelete(reservation)
      openDeleteModal()
    },
    [openDeleteModal],
  )

  const confirmDeleteReservation = useCallback(
    async (deleteAll: boolean) => {
      if (!reservationToDelete) return

      try {
        if (deleteAll) {
          const reservationsToDelete = reservations.filter(
            r =>
              r.reserved_for === reservationToDelete.reserved_for &&
              r.respawn_id === reservationToDelete.respawn_id,
          )
          for (const reservation of reservationsToDelete) {
            await deleteReservation(reservation.id, selectedWorld)
          }
        } else {
          await deleteReservation(reservationToDelete.id, selectedWorld)
        }

        await fetchReservations()
        toast({
          title: deleteAll ? 'Reservas recorrentes removidas' : 'Reserva removida com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } catch (error) {
        toast({
          title: 'Erro ao remover reserva(s)',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      } finally {
        closeDeleteModal()
        setReservationToDelete(null)
      }
    },
    [reservationToDelete, reservations, selectedWorld, closeDeleteModal, fetchReservations, toast],
  )

  useEffect(() => {
    fetchReservations()
    fetchRespawns()
  }, [fetchReservations, fetchRespawns])

  return {
    reservations,
    timeSlots,
    respawns,
    isManagementModalOpen,
    onManagementModalOpen,
    onManagementModalClose,
    isDeleteModalOpen,
    closeDeleteModal,
    handleAddReservation,
    handleDeleteReservation,
    confirmDeleteReservation,
    fetchReservations,
  }
}
