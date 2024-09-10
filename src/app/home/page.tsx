'use client';

import React, { useEffect, useState, useMemo, FC, useCallback, useRef } from 'react';
import { Box, Spinner, Flex, useToast, Text, useDisclosure, VStack, Tooltip, Icon, Switch, Badge, Button, Collapse, Grid, useMediaQuery } from '@chakra-ui/react';
import { InfoIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import DashboardLayout from '../../components/dashboard';
import { GuildMemberResponse } from '../../shared/interface/guild-member.interface';
import { useSession } from 'next-auth/react';
import { upsertPlayer } from '../../services/guilds';
import { useEventSource } from '../../hooks/useEvent';
import { GuildMemberTable } from '../../components/guild';
import { UpsertPlayerInput } from '../../shared/interface/character-upsert.interface';
import { CharacterDetailsModal } from '../../components/guild/character-details-modal';
import { BombaMakerMonitor } from '../../components/guild/character-monitor';

const Home: FC = () => {
  const [guildData, setGuildData] = useState<GuildMemberResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enemyGuildId, setEnemyGuildId] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<GuildMemberResponse | null>(null);
  const [isVerticalLayout, setIsVerticalLayout] = useState(false);
  const [showMonitor, setShowMonitor] = useState(false);
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { data: session, status } = useSession();
  const toast = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLargerThan1280] = useMediaQuery("(min-width: 1280px)");

  const handleMessage = useCallback((data: any) => {
    console.log('Received new data:', JSON.stringify(data, null, 2));
    if (data?.enemy) {
      console.log('Updating guild data with:', JSON.stringify(data.enemy, null, 2));
      setGuildData(data.enemy);
    }
    setIsLoading(false);
  }, []);

  const { error } = useEventSource(
    status === 'authenticated' ? `https://api.firebot.run/subscription/enemy/` : null,
    handleMessage
  );

  useEffect(() => {
    if (error) {
      console.error('Connection error:', error);
    }
  }, [error]);

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

  useEffect(() => {
    console.log('Current guild data:', JSON.stringify(guildData, null, 2));
  }, [guildData]);

  const handleLocalChange = async (member: GuildMemberResponse, newLocal: string) => {
    if (!enemyGuildId) return;

    try {
      const playerData: UpsertPlayerInput = {
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
      console.log(`Updated local for ${member.Name} to ${newLocal}`);
    } catch (error) {
      console.error('Failed to update player:', error);
    }
  };

  const handleMemberClick = useCallback((member: GuildMemberResponse) => {
    console.log('Member clicked:', member);
    setSelectedCharacter(member);
    onDetailsOpen();
  }, [onDetailsOpen]);

  const handleClassify = useCallback(async (type: string) => {
    if (!enemyGuildId || !selectedCharacter) return;

    try {
      const playerData: UpsertPlayerInput = {
        guild_id: enemyGuildId,
        kind: type,
        name: selectedCharacter.Name,
        status: selectedCharacter.Status,
        local: selectedCharacter.Local || '',
      };

      await upsertPlayer(playerData);
      setGuildData(prevData => 
        prevData.map(m => 
          m.Name === selectedCharacter.Name ? { ...m, Kind: type } : m
        )
      );
      setSelectedCharacter(prev => prev ? { ...prev, Kind: type } : null);
      console.log(`Classified ${selectedCharacter.Name} as ${type}`);
      toast({
        title: 'Sucesso',
        description: `${selectedCharacter.Name} classificado como ${type}.`,
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
  }, [enemyGuildId, selectedCharacter, toast]);

  const handleExivaChange = useCallback(async (newExiva: string) => {
    if (!enemyGuildId || !selectedCharacter) return;

    try {
      const playerData: UpsertPlayerInput = {
        guild_id: enemyGuildId,
        kind: selectedCharacter.Kind,
        name: selectedCharacter.Name,
        status: selectedCharacter.Status,
        local: newExiva,
      };

      await upsertPlayer(playerData);
      setGuildData(prevData =>
        prevData.map(m =>
          m.Name === selectedCharacter.Name ? { ...m, Local: newExiva } : m
        )
      );
      setSelectedCharacter(prev => prev ? { ...prev, Local: newExiva } : null);
      console.log(`Updated exiva for ${selectedCharacter.Name} to ${newExiva}`);
    } catch (error) {
      console.error('Failed to update player exiva:', error);
    }
  }, [enemyGuildId, selectedCharacter]);

  const handleLayoutToggle = () => {
    setIsVerticalLayout(!isVerticalLayout);
    console.log(`Layout changed to ${isVerticalLayout ? 'vertical' : 'horizontal'}`);
  };

  const types = useMemo(() => ['main', 'maker', 'bomba', 'fracoks', 'exitados'], []);

  const groupedData = useMemo(() => {
    const grouped = types.map(type => ({
      type,
      data: guildData.filter(member => member.Kind === type),
      onlineCount: guildData.filter(member => member.Kind === type && member.TimeOnline !== '00:00:00').length
    }));
    const unclassified = {
      type: 'unclassified',
      data: guildData.filter(member => !member.Kind || !types.includes(member.Kind)),
      onlineCount: guildData.filter(member => (!member.Kind || !types.includes(member.Kind)) && member.TimeOnline !== '00:00:00').length
    };
    return [...grouped, unclassified].filter(group => group.data.length > 0);
  }, [guildData, types]);

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
      <Box ref={containerRef} maxWidth="100vw" overflow="hidden">
        <VStack spacing={6} align="stretch" style={{ transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%', padding: '2.5%' }}>
          <Box bg="blue.700" p={4} rounded="md">
            <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'stretch', md: 'center' }} justify="space-between">
              <Box mb={{ base: 4, md: 0 }}>
                <Flex align="center">
                  <InfoIcon mr={2} />
                  <Text fontWeight="bold">Instruções de Uso:</Text>
                </Flex>
                <Text mt={2} fontSize="sm">• Clique: ver detalhes do personagem</Text>
                <Text fontSize="sm">• Campo Local: atualizar localização</Text>
              </Box>
              <Flex align="center" justifyContent={{ base: 'flex-start', md: 'flex-end' }} mt={{ base: 2, md: 0 }}>
                <Text mr={2}>Layout:</Text>
                <Switch
                  isChecked={!isVerticalLayout}
                  onChange={handleLayoutToggle}
                  colorScheme="teal"
                />
                <Text ml={2}>{isVerticalLayout ? 'Vertical' : 'Horizontal'}</Text>
              </Flex>
            </Flex>
          </Box>

          <Box>
            <Button
              onClick={() => setShowMonitor(!showMonitor)}
              rightIcon={showMonitor ? <ChevronUpIcon /> : <ChevronDownIcon />}
              mb={4}
              width="100%"
            >
              {showMonitor ? 'Esconder' : 'Mostrar'} Monitor de Bombas e Makers
            </Button>
            <Collapse in={showMonitor} animateOpacity>
              <Box
                p="40px"
                color="white"
                mt="4"
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
          </Box>

          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
              <Spinner size="xl" />
            </Box>
          ) : guildData.length === 0 ? (
            <Box textAlign="center" fontSize="xl" mt={10}>
              <Text>Nenhum dado de guilda disponível.</Text>
            </Box>
          ) : (
            <Grid templateColumns={isVerticalLayout || !isLargerThan1280 ? "1fr" : "repeat(2, 1fr)"} gap={4}>
              {groupedData.map(({ type, data, onlineCount }) => (
                <Box 
                  key={type} 
                  bg="gray.800" 
                  p={4} 
                  rounded="lg" 
                  shadow="md" 
                  height="100%"
                  minHeight="300px"
                  display="flex"
                  flexDirection="column"
                >
                  <Flex justify="space-between" align="center" mb={2}>
                    <Tooltip label={`Personagens ${type === 'unclassified' ? 'não classificados' : `classificados como ${type}`}`} placement="top">
                      <Text fontWeight="bold" cursor="help">
                        {type === 'unclassified' ? 'Sem Classificação' : type.charAt(0).toUpperCase() + type.slice(1)}
                        <Icon as={InfoIcon} ml={1} w={3} h={3} />
                      </Text>
                    </Tooltip>
                    <Badge colorScheme="green">
                      {onlineCount} online
                    </Badge>
                  </Flex>
                  {type === 'exitados' && (
                    <Badge colorScheme="purple" mb={2}>
                      Geralmente em Robson Isle, Thais
                    </Badge>
                  )}
                  <Box flexGrow={1} overflowY="auto">
                    <GuildMemberTable
                      data={data}
                      onLocalChange={handleLocalChange}
                      onMemberClick={handleMemberClick}
                      layout={isVerticalLayout || !isLargerThan1280 ? 'vertical' : 'horizontal'}
                      showExivaInput={type !== 'exitados'}
                      type={type}
                    />
                  </Box>
                </Box>
              ))}
            </Grid>
          )}
        </VStack>
        <CharacterDetailsModal
          isOpen={isDetailsOpen}
          onClose={onDetailsClose}
          character={selectedCharacter}
          onExivaChange={handleExivaChange}
          onClassify={handleClassify}
        />
      </Box>
    </DashboardLayout>
  );
};

export default Home;