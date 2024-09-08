'use client';

import React, { useEffect, useState, useMemo, FC, useCallback, useRef } from 'react';
import { Box, Spinner, Flex, useToast, Text, useDisclosure, VStack, HStack, Tooltip, Icon, Switch, Badge, SimpleGrid } from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import DashboardLayout from '../../components/dashboard';
import { GuildMemberResponse } from '../../shared/interface/guild-member.interface';
import { useSession } from 'next-auth/react';
import { copyExivas } from '../../shared/utils/options-utils';
import { upsertPlayer } from '../../services/guilds';
import { useEventSource } from '../../hooks/useEvent';
import { GuildMemberTable } from '../../components/guild';
import { UpsertPlayerInput } from '../../shared/interface/character-upsert.interface';
import { ClassificationModal } from '../../components/guild/classification-modal';

const Home: FC = () => {
  const [guildData, setGuildData] = useState<GuildMemberResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enemyGuildId, setEnemyGuildId] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<GuildMemberResponse | null>(null);
  const [isVerticalLayout, setIsVerticalLayout] = useState(false);
  const [gridColumns, setGridColumns] = useState(3);
  const [visibleListsCount, setVisibleListsCount] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: session, status } = useSession();
  const toast = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMessage = useCallback((data: any) => {
    if (data?.enemy) {
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
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setGridColumns(1);
      } else if (width < 1200) {
        setGridColumns(2);
      } else {
        setGridColumns(3);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); 

    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    } catch (error) {
      console.error('Failed to update player:', error);
    }
  };

  const handleMemberClick = useCallback((member: GuildMemberResponse) => {
    copyExivas(member, toast);
  }, [toast]);

  const handleOpenClassification = useCallback((member: GuildMemberResponse, event: React.MouseEvent) => {
    event.preventDefault();
    setSelectedMember(member);
    onOpen();
  }, [onOpen]);

  const handleClassify = useCallback(async (type: string) => {
    if (!enemyGuildId || !selectedMember) return;

    try {
      const playerData: UpsertPlayerInput = {
        guild_id: enemyGuildId,
        kind: type,
        name: selectedMember.Name,
        status: selectedMember.Status,
        local: selectedMember.Local || '',
      };

      await upsertPlayer(playerData);
      setGuildData(prevData => 
        prevData.map(m => 
          m.Name === selectedMember.Name ? { ...m, Kind: type } : m
        )
      );
      toast({
        title: 'Sucesso',
        description: `${selectedMember.Name} classificado como ${type}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
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
  }, [enemyGuildId, selectedMember, toast, onClose]);

  const handleLayoutToggle = () => {
    setIsVerticalLayout(!isVerticalLayout);
  };

  const types = useMemo(() => ['main', 'maker', 'bomba', 'fracoks', 'exitados'], []);

  const groupedData = useMemo(() => {
    const grouped = types.map(type => ({
      type,
      data: guildData.filter(member => member.Kind === type)
    }));
    const unclassified = {
      type: 'unclassified',
      data: guildData.filter(member => !member.Kind || !types.includes(member.Kind))
    };
    const filteredGroups = [...grouped, unclassified].filter(group => group.data.length > 0);
    setVisibleListsCount(filteredGroups.length);
    return filteredGroups;
  }, [guildData, types]);

  const getGridColumns = useCallback(() => {
    if (isVerticalLayout) return 1;
    if (visibleListsCount === 1) return 1;
    if (visibleListsCount === 2) return 2;
    return gridColumns;
  }, [isVerticalLayout, visibleListsCount, gridColumns]);

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
      <div ref={containerRef}>
        <VStack spacing={6} align="stretch" w="full">
          <Box bg="blue.700" p={4} rounded="md">
            <Flex align="center" justify="space-between" flexWrap="wrap">
              <Box flex="1" minW="200px" mb={{ base: 4, md: 0 }}>
                <Flex align="center">
                  <InfoIcon mr={2} />
                  <Text fontWeight="bold">Instruções de Uso:</Text>
                </Flex>
                <Text mt={2} fontSize="sm">• Clique esquerdo: copiar exiva</Text>
                <Text fontSize="sm">• Clique direito: classificar personagem</Text>
                <Text fontSize="sm">• Campo Exiva: atualizar localização</Text>
              </Box>
              <Flex align="center">
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

          <SimpleGrid 
            columns={getGridColumns()}
            spacing={4}
            width="100%"
          >
            {isLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                <Spinner size="xl" />
              </Box>
            ) : guildData.length === 0 ? (
              <Box textAlign="center" fontSize="xl" mt={10}>
                <Text>Nenhum dado de guilda disponível.</Text>
              </Box>
            ) : (
              groupedData.map(({ type, data }) => (
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
                  width={visibleListsCount === 1 ? "100%" : "auto"}
                >
                  <Tooltip label={`Personagens ${type === 'unclassified' ? 'não classificados' : `classificados como ${type}`}`} placement="top">
                    <Text mb={2} fontWeight="bold" cursor="help">
                      {type === 'unclassified' ? 'Sem Classificação' : type.charAt(0).toUpperCase() + type.slice(1)}
                      <Icon as={InfoIcon} ml={1} w={3} h={3} />
                    </Text>
                  </Tooltip>
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
                      onClassify={handleOpenClassification}
                      layout={isVerticalLayout ? 'vertical' : 'horizontal'}
                      showExivaInput={type !== 'exitados'}
                    />
                  </Box>
                </Box>
              ))
            )}
          </SimpleGrid>
        </VStack>
        <ClassificationModal
          isOpen={isOpen}
          onClose={onClose}
          onClassify={handleClassify}
          selectedMember={selectedMember?.Name || null}
        />
      </div>
    </DashboardLayout>
  );
};

export default Home;