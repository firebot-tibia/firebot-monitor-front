import React, { useState, useCallback } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Image,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import { Reservation, CreateReservationData, Respawn } from '../../../shared/interface/reservations.interface';
import { AddReservationForm } from '../add-reservations';
import { formatTimeSlotEnd } from '../../../shared/utils/utils';
import { useReservationTable } from '../hooks/useTableHook';

interface ReservationTableProps {
  reservations: Reservation[];
  timeSlots: string[];
  respawns: Respawn[];
  onAddReservation: (data: Omit<CreateReservationData, 'world'> & { respawn_id: string }) => Promise<void>;
  onDeleteReservation: (id: string) => Promise<void>;
  onFetchReservation: () => Promise<void>;
}

const RESPAWNS_PER_TABLE = 6;

export const ReservationTable: React.FC<ReservationTableProps> = (props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedSlot, setSelectedSlot] = useState<{ time: string; respawn: Respawn } | null>(null);
  const { findReservationForSlot, handleAddReservation, handleDeleteReservation } = useReservationTable(props);

  const bgColor = useColorModeValue('gray.800', 'gray.900');
  const textColor = useColorModeValue('gray.100', 'gray.200');
  const buttonBgColor = useColorModeValue('green.500', 'green.400');
  const buttonHoverBgColor = useColorModeValue('green.600', 'green.500');

  const handleAddClick = useCallback((time: string, respawn: Respawn) => {
    setSelectedSlot({ time, respawn });
    onOpen();
  }, [onOpen]);

  const renderTable = useCallback((startIndex: number, endIndex: number) => (
    <Table variant="simple" key={startIndex} size="sm">
      <Thead>
        <Tr>
          <Th color={textColor}>Horário</Th>
          {props.respawns.slice(startIndex, endIndex).map(respawn => (
            <Th key={respawn.id} textAlign="center">
              <VStack spacing={2}>
                {respawn.image && (
                  <Image
                    src={`/assets/images/creatures/${respawn.image}`}
                    alt={respawn.name}
                    boxSize="40px"
                    objectFit="contain"
                  />
                )}
                <Text fontSize="xs" color={textColor}>{respawn.name}</Text>
              </VStack>
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {props.timeSlots.map(timeSlot => (
          <Tr key={timeSlot}>
            <Td color={textColor}>{formatTimeSlotEnd(timeSlot)}</Td>
            {props.respawns.slice(startIndex, endIndex).map(respawn => {
              const reservation = findReservationForSlot(timeSlot, respawn.id || '');
              return (
                <Td key={`${respawn.id}-${timeSlot}`} textAlign="center">
                  {reservation ? (
                    <VStack spacing={1}>
                      <Text fontSize="xs" color="red.400">
                        {reservation.reserved_for}
                      </Text>
                      <Button size="xs" colorScheme="red" onClick={() => handleDeleteReservation(reservation.id)}>
                        Remover
                      </Button>
                    </VStack>
                  ) : (
                    <Button
                      size="xs"
                      bg={buttonBgColor}
                      color="white"
                      _hover={{ bg: buttonHoverBgColor }}
                      onClick={() => handleAddClick(timeSlot, respawn)}
                    >
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
  ), [props.respawns, props.timeSlots, textColor, buttonBgColor, buttonHoverBgColor, findReservationForSlot, handleDeleteReservation, handleAddClick]);

  const tables = [];
  for (let i = 0; i < props.respawns.length; i += RESPAWNS_PER_TABLE) {
    tables.push(renderTable(i, i + RESPAWNS_PER_TABLE));
  }

  return (
    <Box bg={bgColor} p={4} borderRadius="md" overflowX="auto">
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
                  await handleAddReservation({
                    ...data,
                    respawn_id: selectedSlot.respawn.id || '',
                  });
                  onClose();
                }}
                respawnId={selectedSlot.respawn.id || ''}
                timeSlot={selectedSlot.time}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};