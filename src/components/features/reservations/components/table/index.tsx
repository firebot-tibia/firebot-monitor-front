import React, { useCallback, useState } from 'react'

import {
  Box,
  Button,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'

import { formatTimeSlotEnd } from '@/common/utils/format-time-slot'

import { useReservationsManager } from '../../hooks/useReservations'
import { useReservationTable } from '../../hooks/useTableHook'
import type {
  Reservation,
  Respawn,
  CreateReservationData,
} from '../../types/reservations.interface'
import { AddReservationForm } from '../add-reservations'
import { DeleteReservationModal } from '../delete-reservations-modal'

interface ReservationTableProps {
  reservations: Reservation[]
  timeSlots: string[]
  respawns: Respawn[]
  onAddReservation: (
    data: Omit<CreateReservationData, 'world'> & { respawn_id: string },
  ) => Promise<void>
  onFetchReservation: () => Promise<void>
}

const RESPAWNS_PER_TABLE = 6

export const ReservationTable: React.FC<ReservationTableProps> = props => {
  const { isOpen: isAddModalOpen, onOpen: openAddModal, onClose: closeAddModal } = useDisclosure()
  const [selectedSlot, setSelectedSlot] = useState<{ time: string; respawn: Respawn } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { findReservationForSlot } = useReservationTable(props)
  const {
    handleAddReservation,
    handleDeleteReservation,
    confirmDeleteReservation,
    isDeleteModalOpen,
    closeDeleteModal,
  } = useReservationsManager()

  const textColor = useColorModeValue('gray.100', 'gray.200')
  const buttonBgColor = useColorModeValue('green.500', 'green.400')
  const buttonHoverBgColor = useColorModeValue('green.600', 'green.500')

  const handleAddClick = useCallback(
    (time: string, respawn: Respawn) => {
      setSelectedSlot({ time, respawn })
      openAddModal()
    },
    [openAddModal],
  )

  const handleDelete = useCallback(
    (reservation: Reservation) => {
      handleDeleteReservation(reservation)
    },
    [handleDeleteReservation],
  )

  const handleConfirmDelete = useCallback(
    async (deleteAll: boolean) => {
      setIsDeleting(true)
      await confirmDeleteReservation(deleteAll)
      setIsDeleting(false)
      closeDeleteModal()
      props.onFetchReservation()
    },
    [confirmDeleteReservation, closeDeleteModal, props.onFetchReservation],
  )

  const renderTable = useCallback(
    (startIndex: number, endIndex: number) => (
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
                  <Text fontSize="xs" color={textColor}>
                    {respawn.name}
                  </Text>
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
                const reservation = findReservationForSlot(timeSlot, respawn.id || '')
                return (
                  <Td key={`${respawn.id}-${timeSlot}`} textAlign="center">
                    {reservation ? (
                      <VStack spacing={1}>
                        <Text fontSize="xs" color="red.400">
                          {reservation.reserved_for}
                        </Text>
                        <Button
                          size="xs"
                          colorScheme="red"
                          onClick={() => handleDelete(reservation)}
                        >
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
                )
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    ),
    [
      props.respawns,
      props.timeSlots,
      textColor,
      buttonBgColor,
      buttonHoverBgColor,
      findReservationForSlot,
      handleDelete,
      handleAddClick,
    ],
  )

  const tables = []
  for (let i = 0; i < props.respawns.length; i += RESPAWNS_PER_TABLE) {
    tables.push(renderTable(i, i + RESPAWNS_PER_TABLE))
  }

  return (
    <Box p={4} borderRadius="md" overflowX="auto" position="relative">
      {isDeleting && (
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="1000"
        >
          <Spinner size="xl" color="white" />
        </Box>
      )}
      <VStack spacing={8} align="stretch">
        {tables}
      </VStack>
      <Modal isOpen={isAddModalOpen} onClose={closeAddModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Adicionar Reserva</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedSlot && (
              <AddReservationForm
                onSubmit={async data => {
                  await handleAddReservation({
                    ...data,
                    respawn_id: selectedSlot.respawn.id || '',
                  })
                  closeAddModal()
                  props.onFetchReservation()
                }}
                respawnId={selectedSlot.respawn.id || ''}
                timeSlot={selectedSlot.time}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      <DeleteReservationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </Box>
  )
}
