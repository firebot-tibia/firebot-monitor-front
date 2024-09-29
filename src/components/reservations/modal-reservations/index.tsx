import React, { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  VStack, HStack, Input, Button, Box, Text, Image, IconButton, Divider,
  Tabs, TabList, TabPanels, Tab, TabPanel, useColorModeValue
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, TimeIcon, RepeatIcon } from "@chakra-ui/icons";

export const ManagementModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  timeSlots: string[];
  respawns: { name: string; image: string }[];
  addTimeSlot: (slot: string) => void;
  removeTimeSlot: (slot: string) => void;
  addRespawn: (respawn: { name: string; image: string }) => void;
  removeRespawn: (name: string) => void;
}> = ({ isOpen, onClose, timeSlots, respawns, addTimeSlot, removeTimeSlot, addRespawn, removeRespawn }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [newTimeSlot, setNewTimeSlot] = useState("");
  const [newRespawn, setNewRespawn] = useState({ name: "", image: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const bgColor = useColorModeValue("gray.900", "gray.900");
  const borderColor = useColorModeValue("gray.700", "gray.700");
  const inputBgColor = useColorModeValue("gray.800", "gray.800");

  const filteredRespawns = respawns.filter(respawn => 
    respawn.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg={bgColor} color="white">
        <ModalHeader>Gerenciar Horários e Respawns</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Tabs isFitted variant="enclosed" onChange={(index) => setActiveTab(index)}>
            <TabList mb="1em">
              <Tab><TimeIcon mr={2} />Horários</Tab>
              <Tab><RepeatIcon mr={2} />Respawns</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  {timeSlots.map((slot: string) => (
                    <HStack key={slot} p={2} bg={inputBgColor} borderRadius="md">
                      <Text flex={1}>{slot}</Text>
                      <IconButton
                        aria-label="Remove time slot"
                        icon={<DeleteIcon />}
                        onClick={() => removeTimeSlot(slot)}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                      />
                    </HStack>
                  ))}
                  <HStack as="form" onSubmit={(e) => {
                    e.preventDefault();
                    if (newTimeSlot) {
                      addTimeSlot(newTimeSlot);
                      setNewTimeSlot("");
                    }
                  }}>
                    <Input
                      placeholder="Novo horário"
                      value={newTimeSlot}
                      onChange={(e) => setNewTimeSlot(e.target.value)}
                      bg={inputBgColor}
                      borderColor={borderColor}
                    />
                    <IconButton
                      aria-label="Add time slot"
                      icon={<AddIcon />}
                      type="submit"
                      colorScheme="green"
                      variant="solid"
                    />
                  </HStack>
                </VStack>
              </TabPanel>
              <TabPanel>
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
                          onClick={() => removeRespawn(respawn.name)}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                        />
                      </HStack>
                    ))}
                  </Box>
                  <Divider />
                  <HStack as="form" onSubmit={(e) => {
                    e.preventDefault();
                    if (newRespawn.name) {
                      addRespawn(newRespawn);
                      setNewRespawn({ name: "", image: "" });
                    }
                  }}>
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
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};