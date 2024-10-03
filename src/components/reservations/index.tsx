'use client';

import { Button, useDisclosure, useToast, VStack } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { getReservationsList, createReservation, deleteReservation, createRespawn, getAllRespawnsPremiums, removeRespawnApi } from "../../services/guilds";
import { CreateReservationData, Respawn } from "../../shared/interface/reservations.interface";
import { ReservationTable } from "./table";
import { ManagementModal } from "./modal-reservations";
import { SettingsIcon } from "@chakra-ui/icons";
import { defaultTimeSlots } from "../../shared/utils/utils";
import { endOfDay, format, lastDayOfMonth } from 'date-fns';
import { usePermissionCheck } from "../../shared/hooks/usePermissionCheck";

const defaultRespawns = [
  { name: "Issavi", image: "goanna.gif" },
  { name: "Ingol -3", image: "carnivostrich.gif" },
  { name: "Livraria Ice", image: "icecold_book.gif" },
  { name: "Livraria Fire", image: "burning_book.gif" },
  { name: "Livraria Energy", image: "energy_book.gif" },
  { name: "Wardragon -1", image: "wardragon.gif" },
  { name: "Wardragon -2", image: "wardragon.gif" },
  { name: "Piolho -1", image: "piolho.gif" },
  { name: "Piolho -2", image: "piolho2.gif" },
  { name: "Cobra", image: "cobra_assassin.gif" },
  { name: "Rotten Esquerda", image: "rotten_golem.gif" },
  { name: "Rotten Direita", image: "rotten_golem.gif" },
  { name: "Furious Crater (Cloak)", image: "cloak.gif" },
  { name: "Dark Thais", image: "manyfaces.gif" },
  { name: "Ebb and Flow (Fear)", image: "bony.gif" },
  { name: "Brachiodemon", image: "brachiodemon.gif" },
  { name: "Crystal Enigma Sul", image: "mantosaurus.gif" },
  { name: "Crystal Enigma Norte", image: "mantosaurus.gif" },
  { name: "Sparkling Pools Sul", image: "gorerilla.gif" },
  { name: "Sparkling Pools Norte", image: "gorerilla.gif" },
  { name: "Monster Graveyard", image: "nighthunter.gif" },
  { name: "Darklight Core", image: "darklight.gif" },
  { name: "Gloom Pillars", image: "pillar.gif" },
  { name: "Putrefactory", image: "rotten_man.gif" },
];

export const ReservationsManager: React.FC = () => {
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

  useEffect(() => {
    if (guildId) {
      fetchReservations();
      fetchRespawns();
    }
  }, [guildId]);

  const fetchReservations = async () => {
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
  };

  const fetchRespawns = async () => {
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
  };

  const addRespawn = async (newRespawn: { name: string; image: string }) => {
    if (!checkPermission()) return;
    try {
      const createdRespawn = await createRespawn({
        name: newRespawn.name,
        description: newRespawn.name,
        premium: true,
      });
      setRespawns([...respawns, createdRespawn]);
      fetchRespawns();
      toast({
        title: "Respawn criado com sucesso",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to create respawn:', error);
    }
  };

  const removeRespawn = async (id: string) => {
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
  };

  const handleAddReservation = async (data: CreateReservationData & { respawnId: string }) => {
    if (!checkPermission()) return;
    try {
      await createReservation({
        start_time: data.start_time,
        end_time: data.end_time,
        reserved_for: data.reserved_for,
        respawn_id: data.respawnId,
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
      console.error('Failed to create reservation:', error);
    }
  };

  const handleDeleteReservation = async (id: string) => {
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
  };

  return (
    <VStack spacing={8} align="stretch">
      <Button onClick={onManagementModalOpen} leftIcon={<SettingsIcon />}>
        Gerenciar Respawns
      </Button>
      <ReservationTable 
        reservations={reservations} 
        timeSlots={timeSlots} 
        respawns={respawns}
        onAddReservation={handleAddReservation}
        onDeleteReservation={handleDeleteReservation}
        onFetchReservation={fetchReservations}
      />
      <ManagementModal 
        isOpen={isManagementModalOpen}
        onClose={onManagementModalClose}
        respawns={respawns}
        addRespawn={addRespawn}
        removeRespawn={removeRespawn}
      />
    </VStack>
  );
};


