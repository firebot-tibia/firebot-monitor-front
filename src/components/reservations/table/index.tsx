import React, { useState, useMemo } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, Text, Image, Flex, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, VStack } from '@chakra-ui/react';
import { Reservation, CreateReservationData, Respawn } from '../../../shared/interface/reservations.interface';
import { AddReservationForm } from '../add-reservations';
import { formatTimeSlotEnd } from '../../../shared/utils/utils';

interface ReservationTableProps {
  reservations: Reservation[];
  timeSlots: string[];
  respawns: Respawn[];
  onAddReservation: (data: CreateReservationData & { respawnId: string }) => Promise<void>;
  onDeleteReservation: (id: string) => Promise<void>;
  onFetchReservation: () => Promise<void>; 
}

const RESPAWNS_PER_TABLE = 6;

export const ReservationTable: React.FC<ReservationTableProps> = ({ 
  reservations, 
  timeSlots, 
  respawns, 
  onAddReservation, 
  onDeleteReservation,
  onFetchReservation,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedSlot, setSelectedSlot] = useState<{ time: string, respawn: Respawn } | null>(null);

  const handleAddClick = (time: string, respawn: Respawn) => {
    setSelectedSlot({ time, respawn });
    onOpen();
  };

  const handleDeleteClick = async (id: string) => {
    await onDeleteReservation(id);
  };

  const handleReservations = async () => {
    await onFetchReservation();
  };

  const allSlots = useMemo(() => {
    const slots: Record<string, Record<string, Reservation | 'free'>> = {};
    timeSlots.forEach((timeSlot: string) => {
      slots[timeSlot] = {};
      respawns.forEach(respawn => {
        slots[timeSlot][respawn.id || ''] = 'free';
      });
    });

    console.log(reservations);
    
    if (reservations && reservations.length > 0) {
      reservations.forEach(reservation => {
        const startTime = new Date(reservation.start_time).toLocaleString('en-GB').replace(',', '-');
        const timeSlot = timeSlots.find(slot => slot.startsWith(startTime)) || startTime;
        console.log(timeSlot);
        console.log(slots);
        if (slots[timeSlot] && reservation.respawn_id) {
          slots[timeSlot][reservation.respawn_id] = reservation;
        }
      });
    }
    
    return slots;
  }, [timeSlots, respawns, reservations]);

  const renderTable = (startIndex: number, endIndex: number) => (
    <Table variant="simple" key={startIndex}>
      <Thead>
        <Tr>
          <Th>Horário</Th>
          {respawns.slice(startIndex, endIndex).map(respawn => (
            <Th key={respawn.id}>
              <Flex direction="column" align="center">
                {respawn.image && (
                  <Image 
                    src={`/assets/images/creatures/${respawn.image}`} 
                    alt={respawn.name} 
                    boxSize="50px"
                    mb={2}
                  />
                )}
                {respawn.name}
              </Flex>
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {timeSlots.map(timeSlot => (
          <Tr key={timeSlot}>
            <Td>{formatTimeSlotEnd(timeSlot)}</Td>
            {respawns.slice(startIndex, endIndex).map(respawn => {
              const slot = allSlots[timeSlot][respawn.id || ''];
              return (
                <Td key={`${respawn.id}-${timeSlot}`}>
                  {slot !== 'free' ? (
                    <Flex direction="column" align="center">
                      <Text color={slot.status === 'reserved' ? 'red.500' : 'green.500'}>
                        {slot.reserved_for}
                      </Text>
                      <Button size="sm" colorScheme="red" onClick={() => handleDeleteClick(slot.id)}>
                        Remover
                      </Button>
                    </Flex>
                  ) : (
                    <Button size="sm" colorScheme="green" onClick={() => handleAddClick(timeSlot, respawn)}>
                      Adicionar
                    </Button>
                  )}
                </Td>
              );
            })}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );

  const tables = [];
  for (let i = 0; i < respawns.length; i += RESPAWNS_PER_TABLE) {
    tables.push(renderTable(i, i + RESPAWNS_PER_TABLE));
  }

  return (
    <>
      <VStack spacing={8} align="stretch">
        {tables}
      </VStack>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Adicionar Reserva</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedSlot && (
              <AddReservationForm
                onSubmit={async (data) => {
                  await onAddReservation({
                    ...data,
                    respawnId: selectedSlot.respawn.id || '',
                  });
                  handleReservations();
                  onClose();
                }}
                respawnName={selectedSlot.respawn.name}
                timeSlot={selectedSlot.time}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};