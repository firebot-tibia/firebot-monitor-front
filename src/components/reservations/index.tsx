'use client';

import { Button, VStack } from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";
import { ReservationTable } from "./table";
import { ManagementModal } from "./manage-respawns";
import { useReservationsManager } from "./hooks/useReservations";

export const ReservationsManager: React.FC = () => {
  const {
    reservations,
    timeSlots,
    respawns,
    isManagementModalOpen,
    onManagementModalOpen,
    onManagementModalClose,
    handleAddReservation,
    addRespawn,
    removeRespawn,
    fetchReservations
  } = useReservationsManager();

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