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
  List,
  ListItem,
  IconButton,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ChevronDownIcon, DeleteIcon } from '@chakra-ui/icons';
import Navbar from '../../components/navbar';
import { GuildDTO, GuildMemberDTO } from '../../dtos/guild.dto';
import { characterTypeIcons, vocationIcons } from '../../constant/constant';
import { updateCharacter } from '../../services/character';
import { getEnemyGuild } from '../../services/guilds';
import { CharacterType } from '../../shared/enum/character-type.enum';

const Settings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [guildData, setGuildData] = useState<GuildDTO | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<GuildMemberDTO[]>([]);
  const [selectedType, setSelectedType] = useState<CharacterType | null>(null);
  const toast = useToast();

  useEffect(() => {
    const fetchGuildData = async () => {
      try {
        const response = await getEnemyGuild();
        const data = response.data;
        if (data?.guild?.members) {
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
      } catch (error) {
        toast({
          title: 'Erro ao carregar dados.',
          description: 'Não foi possível carregar os dados da guilda.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuildData();
  }, []);

  const handleSelectMember = (member: GuildMemberDTO) => {
    if (!selectedMembers.some((m) => m.name === member.name)) {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const handleRemoveMember = (member: GuildMemberDTO) => {
    setSelectedMembers(selectedMembers.filter((m) => m.name !== member.name));
  };

  const handleSelectType = (type: CharacterType) => {
    setSelectedType(type);
  };

  const handleSubmit = async () => {
    if (!selectedType) {
      toast({
        title: 'Selecione um tipo de personagem.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const promises = selectedMembers.map((member) =>
      updateCharacter(member.name, {
        name: member.name,
        vocation: member.vocation,
        level: member.level,
        type: selectedType,
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
    <div>
      <Navbar />
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
                        {Object.values(CharacterType).map((type) => (
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
                                src={vocationIcons[member.vocation || 'Sorcerer']}
                                alt={member.vocation || 'Sorcerer'}
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
    </div>
  );
};

export default Settings;
