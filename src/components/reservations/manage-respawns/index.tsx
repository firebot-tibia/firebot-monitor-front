import React, { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  VStack, HStack, Input, Box, Text, Image, IconButton,
  useColorModeValue, useToast
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { Respawn } from '../../../shared/interface/reservations.interface';

interface ManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  respawns: Respawn[];
  addRespawn: (respawn: { name: string; image: string }) => void;
  removeRespawn: (id: string) => void;
}

export const ManagementModal: React.FC<ManagementModalProps> = ({
  isOpen,
  onClose,
  respawns,
  addRespawn,
  removeRespawn
}) => {
  const [newRespawn, setNewRespawn] = useState({ name: "", image: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const toast = useToast();

  const bgColor = useColorModeValue("gray.900", "gray.900");
  const borderColor = useColorModeValue("gray.700", "gray.700");
  const inputBgColor = useColorModeValue("gray.800", "gray.800");

  const filteredRespawns = respawns.filter(respawn => 
    respawn.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRespawn = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRespawn.name) {
      addRespawn(newRespawn);
      setNewRespawn({ name: "", image: "" });
    }
  };

  const handleRemoveRespawn = (id: string) => {
    removeRespawn(id);
    toast({
      title: "Respawn removido",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg={bgColor} color="white">
        <ModalHeader>Gerenciar Respawns</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Input
              placeholder="Buscar respawn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg={inputBgColor}
              borderColor={borderColor}
            />
            <Box maxHeight="300px" overflowY="auto">
              {filteredRespawns.map(respawn => (
                <HStack key={respawn.name} p={2} bg={inputBgColor} borderRadius="md" mb={2}>
                  <Image 
                    src={`/assets/images/creatures/${respawn.image}`} 
                    alt={respawn.name} 
                    boxSize="50px"
                    mr={2}
                  />
                  <Text flex={1}>{respawn.name}</Text>
                  <IconButton
                    aria-label="Remove respawn"
                    icon={<DeleteIcon />}
                    onClick={() => handleRemoveRespawn(respawn.id || '')}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                  />
                </HStack>
              ))}
            </Box>
            <HStack as="form" onSubmit={handleAddRespawn}>
              <Input
                placeholder="Nome do respawn"
                value={newRespawn.name}
                onChange={(e) => setNewRespawn({ ...newRespawn, name: e.target.value })}
                bg={inputBgColor}
                borderColor={borderColor}
              />
              <IconButton
                aria-label="Add respawn"
                icon={<AddIcon />}
                type="submit"
                colorScheme="green"
                variant="solid"
              />
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};