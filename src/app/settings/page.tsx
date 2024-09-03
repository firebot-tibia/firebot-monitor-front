'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Flex, Heading, Image, IconButton, List, ListItem, Menu, MenuButton, MenuItem, MenuList, Spinner, Text, VStack, useToast } from '@chakra-ui/react';
import { ChevronDownIcon, DeleteIcon } from '@chakra-ui/icons';
import DashboardLayout from '../../components/dashboard';
import { useSession } from 'next-auth/react';
import { vocationIcons, characterTypeIcons } from '../../constant/character';
import { GuildMemberResponse } from '../../shared/interface/guild-member.interface';
import { upsertPlayer } from '../../services/guilds';
import jwt from 'jsonwebtoken'; 
import { DecodedToken } from '../../shared/dtos/auth.dto';

const Settings = () => {
  const [guildData, setGuildData] = useState<GuildMemberResponse[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<GuildMemberResponse[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const toast = useToast();
  const [enemyGuildId, setEnemyGuildId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.access_token) {
      const decoded = jwt.decode(session.access_token) as DecodedToken;
      if (decoded?.enemy_guild) {
        setEnemyGuildId(decoded.enemy_guild);
      }

      const token = encodeURIComponent(session.access_token);
      const sseUrl = `https://api.firebot.run/subscription/enemy/?token=${token}`;
      const eventSource = new EventSource(sseUrl);

      eventSource.onmessage = function (event) {
        const data = JSON.parse(event.data);
        if (data?.enemy) {
          setGuildData((prevGuildData) => [...(prevGuildData || []), ...data.enemy]);
        }
        setIsLoading(false);
      };

      eventSource.onerror = function (event) {
        console.error('Error occurred:', event);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    }
  }, [session, status]);

  const handleSelectMember = (member: GuildMemberResponse) => {
    if (!selectedMembers.some((m) => m.Name === member.Name)) {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const handleRemoveMember = (member: GuildMemberResponse) => {
    setSelectedMembers(selectedMembers.filter((m) => m.Name !== member.Name));
  };

  const handleSelectType = (type: string) => {
    setSelectedType(type);
  };

  const handleSubmit = async () => {
    if (!selectedType || !enemyGuildId) {
      toast({
        title: 'Erro',
        description: 'Selecione um tipo de personagem e certifique-se de que a guilda foi carregada.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const promises = selectedMembers.map((member) =>
      upsertPlayer({
        guild_id: enemyGuildId,
        name: member.Name,
        status: member.Status,
        kind: selectedType,
        local: member.Local || '',
      })
    );

    try {
      await Promise.all(promises);
      toast({
        title: 'Personagens adicionados com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setSelectedMembers([]);
      setSelectedType(null);
    } catch (err) {
      toast({
        title: 'Erro ao adicionar personagens.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <DashboardLayout>
      <main className="p-4">
        {isLoading ? (
          <VStack align="center">
            <Spinner size="xl" />
            <Text>Carregando...</Text>
          </VStack>
        ) : (
          <Box>
            {guildData && guildData.length > 0 ? (
              <Box mt={4} maxW="md">
                <Box mt={4} maxW="md">
                  <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bg="black" color="white" w="full">
                      Selecione o membro
                    </MenuButton>
                    <MenuList bg="black" color="white" maxH="400px" overflowY="auto">
                      {guildData.map((member, index) => (
                        <MenuItem
                          key={index}
                          bg="black"
                          color="white"
                          _hover={{ bg: "gray.700" }}
                          onClick={() => handleSelectMember(member)}
                        >
                          <Flex align="center">
                            <Image
                              src={vocationIcons[member.Vocation || 'default'] || '/assets/default.gif'}
                              alt={member.Vocation || 'default'}
                              boxSize="20px"
                              mr={2}
                            />
                            {member.Name}
                          </Flex>
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                </Box>
                <Box mt={4} maxW="md">
                  <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bg="black" color="white" w="full">
                      {selectedType ? (
                        <Flex align="center">
                          <Image
                            src={characterTypeIcons[selectedType]}
                            alt={selectedType}
                            boxSize="20px"
                            mr={2}
                          />
                          {selectedType}
                        </Flex>
                      ) : (
                        'Selecione o tipo'
                      )}
                    </MenuButton>
                    <MenuList bg="black" color="white" maxH="400px" overflowY="auto">
                      {Object.keys(characterTypeIcons).map((type) => (
                        <MenuItem
                          key={type}
                          bg="black"
                          color="white"
                          _hover={{ bg: "gray.700" }}
                          onClick={() => handleSelectType(type)}
                        >
                          <Flex align="center">
                            <Image
                              src={characterTypeIcons[type]}
                              alt={type}
                              boxSize="20px"
                              mr={2}
                            />
                            {type}
                          </Flex>
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                </Box>
                <Box mt={4}>
                  <Heading as="h3" size="md" color="white">
                    Personagens Selecionados:
                  </Heading>
                  <List spacing={3} mt={2}>
                    {selectedMembers.map((member, index) => (
                      <ListItem key={index}>
                        <Flex align="center" justify="space-between">
                          <Flex align="center">
                            <Image
                              src={vocationIcons[member.Vocation || 'default']}
                              alt={member.Vocation || 'default'}
                              boxSize="20px"
                              mr={2}
                            />
                            <Text color="white">{member.Name}</Text>
                          </Flex>
                          <IconButton
                            aria-label="Remove"
                            color="blue"
                            icon={<DeleteIcon />}
                            size="sm"
                            onClick={() => handleRemoveMember(member)}
                          />
                        </Flex>
                      </ListItem>
                    ))}
                  </List>
                </Box>
                <Button
                  mt={4}
                  colorScheme="teal"
                  onClick={handleSubmit}
                  disabled={selectedMembers.length === 0 || !selectedType}
                >
                  Adicionar Personagens
                </Button>
              </Box>
            ) : (
              <Text>Nenhum dado disponível.</Text>
            )}
          </Box>
        )}
      </main>
    </DashboardLayout>
  );
};

export default Settings;
