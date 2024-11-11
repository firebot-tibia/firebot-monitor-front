'use client';

import { VStack } from "@chakra-ui/react";
import { ReservationTable } from "./table";
import { useReservationsManager } from "./hooks/useReservations";

export const ReservationsManager: React.FC = () => {
  const {
    reservations,
    timeSlots,
    respawns,
    handleAddReservation,
    fetchReservations
  } = useReservationsManager();

  return (
    <VStack spacing={8} align="stretch">
      <ReservationTable
        reservations={reservations}
        timeSlots={timeSlots}
        respawns={respawns}
        onAddReservation={handleAddReservation}
        onFetchReservation={fetchReservations}
      />
    </VStack>
  );
};