import { useMemo, useCallback } from 'react';
import { Reservation, CreateReservationData, Respawn } from '../../../shared/interface/reservations.interface';
import { convertFrontEndDateToISO } from '../../../shared/utils/utils';

interface UseReservationTableProps {
  reservations: Reservation[];
  timeSlots: string[];
  respawns: Respawn[];
  onAddReservation: (data: Omit<CreateReservationData, 'world'> & { respawn_id: string }) => Promise<void>;
  onDeleteReservation: (id: string) => Promise<void>;
  onFetchReservation: () => Promise<void>;
}

export const useReservationTable = ({
  reservations,
  onAddReservation,
  onDeleteReservation,
  onFetchReservation,
}: UseReservationTableProps) => {
  const reservationMap = useMemo(() => {
    const map: Record<string, Record<string, Reservation>> = {};
    reservations.forEach(reservation => {
      const startTime = reservation.start_time;
      if (!map[startTime]) {
        map[startTime] = {};
      }
      map[startTime][reservation.respawn_id] = reservation;
    });
    return map;
  }, [reservations]);

  const findReservationForSlot = useCallback((timeSlot: string, respawnId: string): Reservation | undefined => {
    const [slotStartStr] = timeSlot.split(' - ');
    const slotStart = convertFrontEndDateToISO(slotStartStr);
    return reservationMap[slotStart]?.[respawnId];
  }, [reservationMap]);

  const handleAddReservation = useCallback(async (data: Omit<CreateReservationData, 'world'> & { respawn_id: string }) => {
    await onAddReservation(data);
    await onFetchReservation();
  }, [onAddReservation, onFetchReservation]);

  const handleDeleteReservation = useCallback(async (id: string) => {
    await onDeleteReservation(id);
    await onFetchReservation();
  }, [onDeleteReservation, onFetchReservation]);

  return {
    findReservationForSlot,
    handleAddReservation,
    handleDeleteReservation,
  };
};