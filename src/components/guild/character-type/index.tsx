import React, { useState } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  VStack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

interface CharacterTypesManagerProps {
  addType: (newType: string) => void;
}

export const CharacterTypesManager: React.FC<CharacterTypesManagerProps> = ({ addType }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newType, setNewType] = useState('');

  const handleAddType = () => {
    if (newType.trim()) {
      addType(newType.trim());
      setNewType('');
      onClose();
    }
  };

  return (
    <>
      <Button 
        onClick={onOpen} 
        size="sm" 
        colorScheme="gray" 
        variant="ghost"
        leftIcon={<AddIcon />}
      >
        Adicionar Tipo
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent 
          bg="gray.800" 
          color="white" 
          borderRadius="md" 
          boxShadow="xl"
        >
          <ModalHeader borderBottomWidth="1px" borderColor="gray.700">
            Adicionar Novo Tipo de Personagem
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm">
                Insira o nome do novo tipo de personagem que você deseja adicionar:
              </Text>
              <Input
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                placeholder="Ex: PT 123"
                bg="gray.700"
                border="none"
                _focus={{ boxShadow: "0 0 0 1px #63B3ED" }}
              />
            </VStack>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor="gray.700">
            <Button 
              onClick={handleAddType} 
              colorScheme="blue" 
              mr={3}
              leftIcon={<AddIcon />}
            >
              Adicionar
            </Button>
            <Button 
              onClick={onClose} 
              variant="ghost"
            >
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};