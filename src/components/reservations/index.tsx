'use client';
import { Box, Button, Divider, HStack, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, useDisclosure, useToast, VStack } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { getReservationsList, createReservation, deleteReservation } from "../../services/guilds";
import { Reservation, CreateReservationData } from "../../shared/interface/reservations.interface";
import { ReservationTable } from "./table";
import { AddIcon } from "@chakra-ui/icons";
import { DeleteIcon } from "lucide-react";

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
  const { isOpen: isTimeModalOpen, onOpen: onTimeModalOpen, onClose: onTimeModalClose } = useDisclosure();
  const { isOpen: isRespawnModalOpen, onOpen: onRespawnModalOpen, onClose: onRespawnModalClose } = useDisclosure();

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

  const TimeSlotModal = () => {
    const [newSlot, setNewSlot] = useState("");

    return (
      <Modal isOpen={isTimeModalOpen} onClose={onTimeModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Gerenciar Horários</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {timeSlots.map((slot: any) => (
                <HStack key={slot}>
                  <Input value={slot} isReadOnly />
                  <Button onClick={() => removeTimeSlot(slot)}>Remover</Button>
                </HStack>
              ))}
              <HStack>
                <Input
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  placeholder="Novo horário"
                />
                <Button onClick={() => {
                  addTimeSlot(newSlot);
                  setNewSlot("");
                }}>
                  Adicionar
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };

  const RespawnModal = () => {
    const [newRespawn, setNewRespawn] = useState({ name: "", image: "" });
    const [searchTerm, setSearchTerm] = useState("");
  
    const filteredRespawns = respawns.filter(respawn => 
      respawn.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    return (
      <Modal isOpen={isRespawnModalOpen} onClose={onRespawnModalClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="gray.900" color="white">
          <ModalHeader>Gerenciar Respawns</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Input
                placeholder="Buscar respawn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="gray.800"
                borderColor="gray.700"
              />
              <Box maxHeight="300px" overflowY="auto">
                {filteredRespawns.map(respawn => (
                  <HStack key={respawn.name} p={2} bg="gray.800" borderRadius="md" mb={2}>
                    <Image
                      src={`/assets/images/creatures/${respawn.image}`}
                      alt={respawn.name}
                      boxSize="30px"
                      mr={2}
                    />
                    <Text flex={1}>{respawn.name}</Text>
                    <IconButton
                      aria-label="Remove respawn"
                      icon={<DeleteIcon />}
                      onClick={() => removeRespawn(respawn.name)}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                    />
                  </HStack>
                ))}
              </Box>
              <Divider />
              <HStack as="form" onSubmit={(e) => {
                e.preventDefault();
                if (newRespawn.name && newRespawn.image) {
                  addRespawn(newRespawn);
                  setNewRespawn({ name: "", image: "" });
                }
              }}>
                <Input
                  placeholder="Nome do respawn"
                  value={newRespawn.name}
                  onChange={(e) => setNewRespawn({ ...newRespawn, name: e.target.value })}
                  bg="gray.800"
                  borderColor="gray.700"
                />
                <Input
                  placeholder="Nome da imagem"
                  value={newRespawn.image}
                  onChange={(e) => setNewRespawn({ ...newRespawn, image: e.target.value })}
                  bg="gray.800"
                  borderColor="gray.700"
                />
                <IconButton
                  aria-label="Add respawn"
                  icon={<AddIcon />}
                  type="submit"
                  colorScheme="green"
                  variant="solid"
                />
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };

  return (
    <VStack spacing={8} align="stretch">
      <HStack>
        <Button onClick={onTimeModalOpen}>Gerenciar Horários</Button>
        <Button onClick={onRespawnModalOpen}>Gerenciar Respawns</Button>
      </HStack>
      <ReservationTable 
        reservations={reservations} 
        timeSlots={timeSlots} 
        respawns={respawns}
        onAddReservation={handleAddReservation}
        onDeleteReservation={handleDeleteReservation}
      />
      <TimeSlotModal />
      <RespawnModal />
    </VStack>
  );
};