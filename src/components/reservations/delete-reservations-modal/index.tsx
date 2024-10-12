import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
} from '@chakra-ui/react';

interface DeleteReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteAll: boolean) => void;
  isLoading: boolean; 
}

export const DeleteReservationModal: React.FC<DeleteReservationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading, 
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Excluir Reserva</ModalHeader>
        <ModalBody>
          <Text>Você deseja excluir apenas esta reserva ou todas as reservas recorrentes?</Text>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={() => onConfirm(false)} isDisabled={isLoading}>
            Apenas esta
          </Button>
          <Button colorScheme="red" onClick={() => onConfirm(true)} isDisabled={isLoading}>
            Todas as recorrentes
          </Button>
          <Button variant="ghost" onClick={onClose} isDisabled={isLoading}>Cancelar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
