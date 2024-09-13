'use client';
import React, { FC, useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  VStack, 
  Flex, 
  Text, 
  Spinner, 
  useToast, 
  SimpleGrid, 
  Switch, 
  Button, 
  Collapse, 
  Accordion, 
  AccordionItem, 
  AccordionButton, 
  AccordionPanel, 
  AccordionIcon,
  Badge,
  Icon,
  Tooltip,
  useMediaQuery
} from '@chakra-ui/react';
import { InfoIcon, ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import DashboardLayout from '../../components/dashboard';
import { useDeaths } from '../../hooks/useDeaths';
import { useEventSource } from '../../hooks/useEvent';
import { GuildMemberResponse } from '../../shared/interface/guild-member.interface';
import { Death } from '../../shared/interface/death.interface';
import { useSession } from 'next-auth/react';
import { upsertPlayer } from '../../services/guilds';
import { BombaMakerMonitor } from '../../components/guild/character-monitor';
import DeathTable from '../../components/death';
import { GuildMemberTable } from '../../components/guild';


const Home: FC = () => {
  const [newDeathCount, setNewDeathCount] = useState(0);
  const { deathList, addDeath } = useDeaths();
  const toast = useToast();
  const [guildData, setGuildData] = useState<GuildMemberResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enemyGuildId, setEnemyGuildId] = useState<string | null>(null);
  const [isVerticalLayout, setIsVerticalLayout] = useState(false);
  const [showMonitor, setShowMonitor] = useState(false);
  const { data: session, status } = useSession();

  const handleNewDeath = useCallback((newDeath: Death) => {
    addDeath(newDeath);
    setNewDeathCount((prev) => prev + 1);
    toast({
      title: "Nova morte registrada",
      description: `${newDeath.name} morreu.`,
      status: "info",
      duration: 5000,
      isClosable: true,
    });
  }, [addDeath, toast]);

  const handleMessage = useCallback((data: any) => {
    if (data?.enemy) {
      setGuildData(data.enemy);
    }
    if (data?.death) {
      const newDeath: Death = {
        ...data.death,
        id: `${data.death.name}-${Date.now()}`,
        date: new Date(data.death.date || Date.now()),
        death: data.death.text,
      };
      handleNewDeath(newDeath);
    }
    setIsLoading(false);
  }, [handleNewDeath]);

  const { error } = useEventSource(
    status === 'authenticated' ? `https://api.firebot.run/subscription/enemy/` : null,
    handleMessage
  );

  useEffect(() => {
    if (error) {
      console.error('Connection error:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor de eventos.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (status === 'authenticated' && session?.access_token) {
      try {
        const decoded = JSON.parse(atob(session.access_token.split('.')[1]));
        if (decoded?.enemy_guild) {
          setEnemyGuildId(decoded.enemy_guild);
        }
      } catch (error) {
        console.error('Error decoding access token:', error);
      }
    }
  }, [status, session]);

  const handleLocalChange = async (member: GuildMemberResponse, newLocal: string) => {
    if (!enemyGuildId) return;

    try {
      const playerData = {
        guild_id: enemyGuildId,
        kind: member.Kind,
        name: member.Name,
        status: member.Status,
        local: newLocal,
      };

      await upsertPlayer(playerData);
      setGuildData(prevData =>
        prevData.map(m =>
          m.Name === member.Name ? { ...m, Local: newLocal } : m
        )
      );
    } catch (error) {
      console.error('Failed to update player:', error);
    }
  };

  const handleClassificationChange = async (member: GuildMemberResponse, newClassification: string) => {
    if (!enemyGuildId) return;
  
    try {
      const playerData = {
        guild_id: enemyGuildId,
        kind: newClassification,
        name: member.Name,
        status: member.Status,
        local: member.Local || '',
      };
  
      await upsertPlayer(playerData);
      setGuildData(prevData => 
        prevData.map(m => 
          m.Name === member.Name ? { ...m, Kind: newClassification } : m
        )
      );
      toast({
        title: 'Sucesso',
        description: `${member.Name} classificado como ${newClassification}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to classify player:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao classificar o jogador.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const types = ['main', 'maker', 'bomba', 'fracoks', 'exitados', 'mwall'];
  const groupedData = types.map(type => ({
    type,
    data: guildData.filter(member => member.Kind === type),
    onlineCount: guildData.filter(member => member.Kind === type && member.TimeOnline !== '00:00:00').length
  }));
  const unclassified = {
    type: 'unclassified',
    data: guildData.filter(member => !member.Kind || !types.includes(member.Kind)),
    onlineCount: guildData.filter(member => (!member.Kind || !types.includes(member.Kind)) && member.TimeOnline !== '00:00:00').length
  };
  const allGroupedData = [...groupedData, unclassified].filter(group => group.data.length > 0);

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <Spinner size="xl" />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box maxWidth="100%" overflow="hidden" fontSize="xs">
        <VStack spacing={1} align="stretch">
          <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" bg="blue.900" p={2} mt={4} rounded="md">
            <Box>
              <Flex align="center">
                <InfoIcon mr={1} />
                <Text fontWeight="bold">Instruções:</Text>
              </Flex>
              <Text fontSize="xs">• Clique no personagem: ver detalhes</Text>
              <Text fontSize="xs">• Campo Local: atualizar em qual local do jogo o personagem se encontra.</Text>
              <Text fontSize="xs">• Clique no nome: para copiar o exiva para o CTRL+C</Text>
            </Box>
            <Flex align="center" mt={{ base: 2, md: 0 }}>
              <Text mr={2}>Layout:</Text>
              <Switch
                isChecked={!isVerticalLayout}
                onChange={() => setIsVerticalLayout(!isVerticalLayout)}
                colorScheme="teal"
                size="sm"
              />
              <Text ml={2}>{isVerticalLayout ? 'Vertical' : 'Horizontal'}</Text>
            </Flex>
          </Flex>

          <Button
            onClick={() => setShowMonitor(!showMonitor)}
            rightIcon={showMonitor ? <ChevronUpIcon /> : <ChevronDownIcon />}
            size="sm"
            width="100%"
            variant="outline"
            bg="gray.700"
            _hover={{ bg: 'gray.600' }}
          >
            {showMonitor ? 'Esconder' : 'Mostrar'} Monitor de Masslog nas listas
          </Button>
          <Collapse in={showMonitor} animateOpacity>
            <Box
              p={2}
              color="white"
              bg="gray.700"
              rounded="md"
              shadow="md"
            >
              <BombaMakerMonitor
                characters={guildData}
                isLoading={isLoading}
              />
            </Box>
          </Collapse>

          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
              <Spinner size="xl" />
            </Box>
          ) : guildData.length === 0 ? (
            <Box textAlign="center" fontSize="xl" mt={10}>
              <Text>Nenhum dado de guilda disponível.</Text>
            </Box>
          ) : (
            <SimpleGrid columns={3} spacing={1}>
              {allGroupedData.map(({ type, data, onlineCount }) => (
                <Box 
                  key={type} 
                  bg="gray.800" 
                  p={2} 
                  rounded="lg" 
                  shadow="md" 
                  height="100%"
                  minHeight="200px"
                  display="flex"
                  flexDirection="column"
                >
                  <Flex justify="space-between" align="center" mb={1}>
                    <Tooltip label={`Personagens ${type === 'unclassified' ? 'não classificados' : `classificados como ${type}`}`} placement="top">
                      <Text fontWeight="bold" cursor="help" fontSize="xs">
                        {type === 'unclassified' ? 'Sem Classificação' : type.charAt(0).toUpperCase() + type.slice(1)}
                        <Icon as={InfoIcon} ml={1} w={2} h={2} />
                      </Text>
                    </Tooltip>
                    <Badge colorScheme="green" fontSize="xx-small">
                      {onlineCount} online
                    </Badge>
                  </Flex>
                  {type === 'exitados' && (
                    <Badge colorScheme="purple" mb={1} fontSize="xx-small">
                      Geralmente em Robson Isle, Thais
                    </Badge>
                  )}
                  <Box flexGrow={1} overflowY="auto">
                    <GuildMemberTable
                      data={data}
                      onLocalChange={handleLocalChange}
                      onClassificationChange={handleClassificationChange}
                      layout={isVerticalLayout ? 'vertical' : 'horizontal'}
                      showExivaInput={type !== 'exitados'}
                      fontSize="xs"
                    />
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          )}

          <Accordion allowToggle>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="center">
                    Mortes Recentes
                  </Box>
                  <AccordionIcon />
                  {newDeathCount > 0 && (
                    <Badge ml={2} colorScheme="red" borderRadius="full">
                      {newDeathCount}
                    </Badge>
                  )}
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <DeathTable deathList={deathList} onNewDeath={handleNewDeath} />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </VStack>
      </Box>
    </DashboardLayout>
  );
};

export default Home;