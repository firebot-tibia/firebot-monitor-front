'use client';

import {
  Box,
  Heading,
  Text,
  useToast,
  Spinner,
  VStack,
  Flex,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { io } from 'socket.io-client';
import Navbar from '../../components/navbar';
import { GuildDTO, GuildMemberDTO } from '../../dtos/guild.dto';
import { vocationIcons } from '../../constant/constant';

const Settings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [guildData, setGuildData] = useState<GuildDTO | null>(null);
  const [selectedMember, setSelectedMember] = useState<GuildMemberDTO | null>(null);
  const toast = useToast();
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';


  useEffect(() => {
    const socket = io(socketUrl);

    socket.on('guildData', (data: GuildDTO) => {
      if (data?.guild.members) {
        setGuildData(data);
      } else {
        toast({
          title: 'Erro ao carregar dados.',
          description: 'Não foi possível carregar os dados da guilda.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
      setIsLoading(false);
    });

    socket.emit('requestGuildData');

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSelectMember = (member: GuildMemberDTO) => {
    setSelectedMember(member);
  };

  return (
    <div>
      <Navbar />
      <main className="p-4">
        <Heading as="h1" size="xl" mb={4}>Configurações</Heading>
        {isLoading ? (
          <VStack align="center">
            <Spinner size="xl" />
            <Text>Carregando...</Text>
          </VStack>
        ) : (
          <Box>
            {guildData ? (
              <Box>
                <Text>Total Online: {guildData.guild.total_online}</Text>
                <Box mt={4} maxW="md">
                  <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bg="black" color="white">
                      Selecione o membro
                    </MenuButton>
                    <MenuList bg="black" color="white" maxH="400px" overflowY="auto">
                      {guildData.guild.members.map((member, index) => {
                        const vocation = member.vocation || 'default';
                        return (
                          <MenuItem 
                            key={index} 
                            bg="black" 
                            color="white" 
                            _hover={{ bg: "gray.700" }}
                            onClick={() => handleSelectMember(member)}
                          >
                            <Flex align="center">
                              <Image
                                src={vocationIcons[vocation] || '/assets/default.gif'}
                                alt={vocation}
                                boxSize="20px"
                                mr={2}
                              />
                              {member.name}
                            </Flex>
                          </MenuItem>
                        );
                      })}
                    </MenuList>
                  </Menu>
                </Box>
                {selectedMember && (
                  <Box mt={4} p={4} bg="gray.800" color="white" borderRadius="md">
                    <Flex align="center">
                      <Image
                        src={vocationIcons[selectedMember.vocation || 'default'] || '/assets/default.gif'}
                        alt={selectedMember.vocation || 'default'}
                        boxSize="20px"
                        mr={2}
                      />
                      <Text>{selectedMember.name}</Text>
                    </Flex>
                  </Box>
                )}
              </Box>
            ) : (
              <Text>Nenhum dado disponível.</Text>
            )}
          </Box>
        )}
      </main>
    </div>
  );
};

export default Settings;