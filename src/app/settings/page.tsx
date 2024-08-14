'use client';

import {
  Box,
  Heading,
  Text,
  Spinner,
  VStack,
  Flex,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  List,
  ListItem,
  IconButton,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ChevronDownIcon, DeleteIcon } from '@chakra-ui/icons';
import { characterTypeIcons, vocationIcons } from '../../constant/character';
import DashboardLayout from '../../components/dashboard';
import { useSession } from 'next-auth/react';
import { useToastContext } from '../../context/toast/toast-context';
import { getGuildPlayers, upsertPlayer } from '../../services/guilds';
import { GuildMemberResponse } from '../../shared/interface/guild-member.interface';

const Settings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [guildData, setGuildData] = useState<GuildMemberResponse[] | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<GuildMemberResponse[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { showToast } = useToastContext();
  const { data: session } = useSession();

  useEffect(() => {
    const fetchGuildData = async () => {
      if (session?.user?.enemy_guild) {
        try {
          const data = await getGuildPlayers(session.user.enemy_guild);
          setGuildData(data.guild.members);
        } catch (error) {
          showToast({
            title: 'Erro ao carregar dados.',
            description: 'Não foi possível carregar os dados da guilda.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchGuildData();
  }, [session, showToast]);

  const handleSelectMember = (member: GuildMemberResponse) => {
    if (!selectedMembers.some((m) => m.name === member.name)) {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const handleRemoveMember = (member: GuildMemberResponse) => {
    setSelectedMembers(selectedMembers.filter((m) => m.name !== member.name));
  };

  const handleSelectType = (type: string) => {
    setSelectedType(type);
  };

  const handleSubmit = async () => {
    if (!selectedType) {
      showToast({
        title: 'Selecione um tipo de personagem.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const promises = selectedMembers.map((member) =>
      upsertPlayer({
        name: member.name,
        status: member.status,
        kind: selectedType,
      })
    );

    try {
      await Promise.all(promises);
      showToast({
        title: 'Personagens adicionados com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setSelectedMembers([]);
      setSelectedType(null);
    } catch (err) {
      showToast({
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
            {guildData ? (
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
                              src={vocationIcons[member.vocation || 'default'] || '/assets/default.gif'}
                              alt={member.vocation || 'default'}
                              boxSize="20px"
                              mr={2}
                            />
                            {member.name}
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
                              src={vocationIcons[member.vocation || 'default']}
                              alt={member.vocation || 'default'}
                              boxSize="20px"
                              mr={2}
                            />
                            <Text color="white">{member.name}</Text>
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
