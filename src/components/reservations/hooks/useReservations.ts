import { useToast, useDisclosure } from "@chakra-ui/react";
import { endOfDay, format, lastDayOfMonth, startOfDay } from "date-fns";
import { useState, useEffect, useCallback } from "react";
import { getReservationsList, getAllRespawnsPremiums, createRespawn, removeRespawnApi, createReservation, deleteReservation } from "../../../services/guilds";
import { usePermissionCheck } from "../../../shared/hooks/usePermissionCheck";
import { Respawn, CreateReservationData, Reservation } from "../../../shared/interface/reservations.interface";
import { defaultTimeSlots } from "../../../shared/utils/utils";
import { defaultRespawns } from "../../../constant/respawn";
import { useTokenStore } from "../../../store/token-decoded-store";
import { useStorageStore } from "../../../store/storage-store";

export const useReservationsManager = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [timeSlots] = useState(defaultTimeSlots);
  const [respawns, setRespawns] = useState<Respawn[]>([]);
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);
  const toast = useToast();
  const checkPermission = usePermissionCheck();
  const { isOpen: isManagementModalOpen, onOpen: onManagementModalOpen, onClose: onManagementModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: openDeleteModal, onClose: closeDeleteModal } = useDisclosure();
  const { selectedWorld } = useTokenStore();

  const fetchReservations = useCallback(async () => {
    const now = new Date();
    const firstDayOfMonth = format(startOfDay(now), 'dd/MM/yyyy-HH:mm');
    const lastDayOfCurrentMonth = format(endOfDay(lastDayOfMonth(now)), 'dd/MM/yyyy-HH:mm');
  
    try {
      const guildId = useStorageStore.getState().getItem('selectedGuildId', '');
      if (!guildId) {
        console.error('No guild selected');
        return;
      }
      const response = await getReservationsList({
        guild_id: guildId,
        start_time_greater: firstDayOfMonth,
        end_time_less: lastDayOfCurrentMonth,
        kind: 'ally',
        world: selectedWorld,
      });
      setReservations(response);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    }
  }, [selectedWorld]);

  const fetchRespawns = useCallback(async () => {
    try {
      const respawnsData = await getAllRespawnsPremiums();
      const respawnsWithImages = respawnsData.map((respawn: Respawn) => ({
        ...respawn,
        image: respawn.image || defaultRespawns.find(r => r.name === respawn.name)?.image || "deer.gif"
      }));
      setRespawns(respawnsWithImages);
    } catch (error) {
      console.error('Failed to fetch respawns:', error);
    }
  }, []);

  const addRespawn = useCallback(async (newRespawn: { name: string; image: string }) => {
    if (!checkPermission()) return;
    try {
      const createdRespawn = await createRespawn({
        name: newRespawn.name,
        description: newRespawn.name,
        premium: true,
      });
      setRespawns(prev => [...prev, createdRespawn]);
      fetchRespawns();
      toast({
        title: "Respawn criado com sucesso",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to create respawn:', error);
      toast({
        title: "Esse respawn já existe",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [checkPermission, fetchRespawns, toast]);

  const removeRespawn = useCallback(async (id: string) => {
    if (!checkPermission()) return;
    if (id) {
      await removeRespawnApi(id);
      fetchRespawns();
      toast({
        title: "Respawn removido com sucesso",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [checkPermission, fetchRespawns, toast]);

  const handleAddReservation = useCallback(async (data: Omit<CreateReservationData, 'world'> & { respawn_id: string }) => {
    if (!checkPermission()) return;
    try {
      await createReservation({
        start_time: data.start_time,
        end_time: data.end_time,
        reserved_for: data.reserved_for,
        respawn_id: data.respawn_id,
        kind: 'ally',
      }, selectedWorld);
      await fetchReservations();
    } catch (error) {
      toast({
        title: "Esse respawn já está reservado",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error('Failed to create reservation:', error);
    }
  }, [checkPermission, toast, selectedWorld, fetchReservations]);

  const handleDeleteReservation = useCallback((reservation: Reservation) => {
    setReservationToDelete(reservation);
    openDeleteModal();
  }, [openDeleteModal]);

  const confirmDeleteReservation = useCallback(async (deleteAll: boolean) => {
    if (!reservationToDelete) return;

    try {
      if (deleteAll) {
        const reservationsToDelete = reservations.filter(
          r => r.reserved_for === reservationToDelete.reserved_for &&
               r.respawn_id === reservationToDelete.respawn_id
        );
        for (const reservation of reservationsToDelete) {
          await deleteReservation(reservation.id, selectedWorld);
        }
      } else {
        await deleteReservation(reservationToDelete.id, selectedWorld);
      }

      await fetchReservations();
      toast({
        title: deleteAll ? "Reservas recorrentes removidas" : "Reserva removida com sucesso",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to delete reservation(s):', error);
      toast({
        title: "Erro ao remover reserva(s)",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      closeDeleteModal();
      setReservationToDelete(null);
    }
  }, [reservationToDelete, reservations, selectedWorld, closeDeleteModal, fetchReservations, toast]);

  useEffect(() => {
    fetchReservations();
    fetchRespawns();
  }, [fetchReservations, fetchRespawns]);

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
    addRespawn,
    removeRespawn,
    fetchReservations
  };
};
