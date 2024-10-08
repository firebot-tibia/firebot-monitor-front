import { useToast, useDisclosure } from "@chakra-ui/react";
import { endOfDay, format, lastDayOfMonth } from "date-fns";
import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { getReservationsList, getAllRespawnsPremiums, createRespawn, removeRespawnApi, createReservation, deleteReservation } from "../../../services/guilds";
import { usePermissionCheck } from "../../../shared/hooks/usePermissionCheck";
import { Respawn, CreateReservationData } from "../../../shared/interface/reservations.interface";
import { defaultTimeSlots } from "../../../shared/utils/utils";
import { defaultRespawns } from "../../../constant/respawn";

export const useReservationsManager = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [timeSlots] = useState(defaultTimeSlots);
  const [respawns, setRespawns] = useState<Respawn[]>([]);
  const [guildId, setGuildId] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const toast = useToast();
  const checkPermission = usePermissionCheck();
  const { isOpen: isManagementModalOpen, onOpen: onManagementModalOpen, onClose: onManagementModalClose } = useDisclosure();

  useEffect(() => {
    if (status === 'authenticated' && session?.access_token) {
      try {
        const decoded = JSON.parse(atob(session.access_token.split('.')[1]));
        if (decoded?.ally_guild) {
          setGuildId(decoded.ally_guild);
        }
      } catch (error) {
        console.error('Error decoding access token:', error);
      }
    }
  }, [status, session, toast]);

  const fetchReservations = useCallback(async () => {
    if (!guildId) return;
    const now = new Date();
    const firstDayOfMonth = format(now, '01/MM/yyyy-00:00');
    const lastDayOfCurrentMonth = format(endOfDay(lastDayOfMonth(now)), 'dd/MM/yyyy-HH:mm');
  
    try {
      const response = await getReservationsList({
        guild_id: guildId,
        start_time_greater: firstDayOfMonth,
        end_time_less: lastDayOfCurrentMonth,
        kind: "ally"
      });
      setReservations(response);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    }
}, [guildId]);

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
        title: "Esse respawn ja existe",
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

  const handleAddReservation = useCallback(async (data: CreateReservationData & { respawn_id: string }) => {
    if (!checkPermission()) return;
    try {
      console.log(data);
      await createReservation({
        start_time: data.start_time,
        end_time: data.end_time,
        reserved_for: data.reserved_for,
        respawn_id: data.respawn_id,
        kind: "ally"
      });
      fetchReservations();
      toast({
        title: "Reserva adicionada com sucesso",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Esse respawn ja esta reservado",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error('Failed to create reservation:', error);
    }
  }, [checkPermission, fetchReservations, toast]);

  const handleDeleteReservation = useCallback(async (id: string) => {
    if (!checkPermission()) return;
    try {
      await deleteReservation(id);
      fetchReservations();
      toast({
        title: "Reserva removida com sucesso",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to delete reservation:', error);
    }
  }, [checkPermission, fetchReservations, toast]);


  useEffect(() => {
    if (guildId) {
      fetchReservations();
      fetchRespawns();
    }
  }, [guildId, fetchReservations, fetchRespawns]);

  return {
    reservations,
    timeSlots,
    respawns,
    isManagementModalOpen,
    onManagementModalOpen,
    onManagementModalClose,
    handleAddReservation,
    handleDeleteReservation,
    addRespawn,
    removeRespawn,
    fetchReservations
  };
};