import React, { useState } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, Text, Image, Flex, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, VStack } from '@chakra-ui/react';
import { Reservation, CreateReservationData, Respawn } from '../../../shared/interface/reservations.interface';
import { AddReservationForm } from '../add-reservations';
import { formatTimeSlotEnd } from '../../../shared/utils/utils';

interface ReservationTableProps {
  reservations: Reservation[];
  timeSlots: string[];
  respawns: Respawn[];
  onAddReservation: (data: CreateReservationData & { respawnId: string }) => Promise<void>;
  onDeleteReservation: (id: number) => Promise<void>;
}

const RESPAWNS_PER_TABLE = 6;

export const ReservationTable: React.FC<ReservationTableProps> = ({ reservations, timeSlots, respawns, onAddReservation, onDeleteReservation }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedSlot, setSelectedSlot] = useState<{ time: string, respawn: Respawn } | null>(null);

  const handleAddClick = (time: string, respawn: Respawn) => {
    setSelectedSlot({ time, respawn });
    onOpen();
  };

  const handleDeleteClick = async (id: number) => {
    await onDeleteReservation(id);
  };

  const renderTable = (startIndex: number, endIndex: number) => (
    <Table variant="simple" key={startIndex}>
      <Thead>
        <Tr>
          <Th>Horário</Th>
          {respawns.slice(startIndex, endIndex).map(respawn => (
            <Th key={respawn.name}>
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
              const reservation = reservations.find(r => 
                r.respawn.name === respawn.name && 
                r.start_time === timeSlot
              );
              return (
                <Td key={`${respawn.name}-${timeSlot}`}>
                  {reservation ? (
                    <Flex direction="column" align="center">
                      <Text color={reservation.status === 'reserved' ? 'red.500' : 'green.500'}>
                        {reservation.reserved_for}
                      </Text>
                      <Button size="sm" colorScheme="red" onClick={() => handleDeleteClick(Number(reservation.id))}>
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
                    respawnId: selectedSlot.respawn.id || ''
                  });
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