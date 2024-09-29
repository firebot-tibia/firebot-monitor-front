'use client';
import { Button, useDisclosure, useToast, VStack } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { getReservationsList, createReservation, deleteReservation } from "../../services/guilds";
import { Reservation, CreateReservationData } from "../../shared/interface/reservations.interface";
import { ReservationTable } from "./table";
import { ManagementModal } from "./modal-reservations";
import { SettingsIcon } from "@chakra-ui/icons";


const defaultTimeSlots = [
  "SS - 9:30", "9:30 - 12:40", "12:40 - 15:50", "15:50 - 19:00",
  "19:00 - 22:10", "22:10 - 1:20", "1:20 - SS"
];

const defaultRespawns = [
  { name: "Issavi", image: "goanna.gif" },
  { name: "Ingol -3", image: "carnivostrich.gif" },
  { name: "Livraria Ice", image: "icecold_book.gif" },
  { name: "Livraria Fire", image: "burning_book.gif" },
  { name: "Livraria Energy", image: "energy_book.gif" },
  { name: "Wardragon -1", image: "wardragon.gif" },
  { name: "Wardragon -2", image: "wardragon.gif" },
  { name: "Piolho -1", image: "" },
  { name: "Piolho -2", image: "" },
  { name: "Cobra", image: "cobra_assassin.gif" },
  { name: "Soul War", image: "" },
  { name: "Rotten Esquerda", image: "rotten_golem.gif" },
  { name: "Rotten Direita", image: "rotten_golem.gif" },
  { name: "Furious Crater (Cloak)", image: "" },
  { name: "Dark Thais", image: "" },
  { name: "Ebb and Flow (Fear)", image: "" },
  { name: "Brachiodemon", image: "brachiodemon.gif" },
  { name: "Crystal Enigma Sul", image: "" },
  { name: "Crystal Enigma Norte", image: "" },
  { name: "Sparkling Pools Sul", image: "" },
  { name: "Sparkling Pools Norte", image: "" },
  { name: "Monster Graveyard", image: "" },
  { name: "Darklight Core", image: "darklight.gif" },
  { name: "Gloom Pillars", image: "pillar.gif" },
  { name: "Putrefactory", image: "" },
  { name: "Jaded Roots", image: "" }
];

export const ReservationsManager: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [timeSlots, setTimeSlots] = useState(defaultTimeSlots);
  const [respawns, setRespawns] = useState(defaultRespawns);
  const [guildId, setGuildId] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const toast = useToast();
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
    }
  }, [guildId]);

  const fetchReservations = async () => {
    if (!guildId) return;
    try {
      const response = await getReservationsList({ guild_id: guildId });
      setReservations(response.reservations);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    }
  };

  const handleAddReservation = async (data: CreateReservationData) => {
    try {
      await createReservation(data);
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

  const handleDeleteReservation = async (id: number) => {
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


  const addTimeSlot = (newSlot: string) => {
    setTimeSlots([...timeSlots, newSlot]);
  };

  const removeTimeSlot = (slotToRemove: string) => {
    setTimeSlots(timeSlots.filter((slot: any) => slot !== slotToRemove));
  };

  const addRespawn = (newRespawn: { name: string; image: string }) => {
    setRespawns([...respawns, newRespawn]);
  };

  const removeRespawn = (respawnToRemove: string) => {
    setRespawns(respawns.filter((respawn: any) => respawn.name !== respawnToRemove));
  };

    return (
      <VStack spacing={8} align="stretch">
        <Button onClick={onManagementModalOpen} leftIcon={<SettingsIcon />}>
          Gerenciar Horários e Respawns
        </Button>
        <ReservationTable 
          reservations={reservations} 
          timeSlots={timeSlots} 
          respawns={respawns}
          onAddReservation={handleAddReservation}
          onDeleteReservation={handleDeleteReservation}
        />
        <ManagementModal 
          isOpen={isManagementModalOpen}
          onClose={onManagementModalClose}
          timeSlots={timeSlots}
          respawns={respawns}
          addTimeSlot={addTimeSlot}
          removeTimeSlot={removeTimeSlot}
          addRespawn={addRespawn}
          removeRespawn={removeRespawn}
        />
      </VStack>
    );
  };