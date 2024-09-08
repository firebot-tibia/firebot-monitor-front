import React, { FC, useMemo } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Image,
  Text
} from '@chakra-ui/react';
import { characterTypeIcons } from '../../../constant/character';

interface ClassificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClassify: (type: string) => void;
  selectedMember: string | null;
}

export const ClassificationModal: FC<ClassificationModalProps> = ({ 
  isOpen, 
  onClose, 
  onClassify, 
  selectedMember 
}) => {
  const types = useMemo(() => ['main', 'maker', 'bomba', 'fracoks', 'exitados'], []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg="gray.800" borderColor="gray.600" borderWidth={1}>
        <ModalHeader>Classificar Personagem</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {selectedMember && (
            <Text mb={4}>Classificando: {selectedMember}</Text>
          )}
          <VStack spacing={2} align="stretch">
            {types.map((type) => (
              <Button
                key={type}
                onClick={() => {
                  onClassify(type);
                  onClose();
                }}
                size="md"
                leftIcon={<Image src={characterTypeIcons[type]} alt={type} boxSize="20px" />}
                justifyContent="flex-start"
                colorScheme="blue"
                variant="outline"
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};