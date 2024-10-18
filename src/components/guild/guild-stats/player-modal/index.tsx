'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  VStack,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Flex,
  Button,
} from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { getPlayerExperienceHistory, getPlayerOnlineHistory, getPlayersLifeTimeDeaths } from '../../../../services/guilds';
import { OnlineTimeDay, PlayerDeaths } from '../../../../shared/interface/guild/guild-stats-player.interface';
import PlayerDashboard from './player-dashboard';
import { ExperienceDataItem } from '../../../../shared/interface/guild/guild-stats-experience-history.interface';

const CharacterStatsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const characterName = decodeURIComponent(params['character-name'] as string);

  const [onlineHistory, setOnlineHistory] = useState<OnlineTimeDay[]>([]);
  const [experienceData, setExperienceData] = useState<ExperienceDataItem[]>([]);
  const [deathData, setDeathData] = useState<PlayerDeaths | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const textColor = "white";
  const accentColor = "red.800";

  useEffect(() => {
    const fetchData = async () => {
      if (characterName) {
        try {
          setLoading(true);
          setError(null);
          const [onlineData, deathsData, experience] = await Promise.all([
            getPlayerOnlineHistory({ character: characterName }),
            getPlayersLifeTimeDeaths({ character: characterName }),
            getPlayerExperienceHistory({ character: characterName }),
          ]);
          setOnlineHistory(onlineData.online_time.online_time_days || []);
          setExperienceData(experience.experience_history.character_experience_messages);
          setDeathData(deathsData.deaths);
        } catch (err) {
          console.error('Error fetching player data:', err);
          setError('Falha ao buscar dados do jogador');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [characterName]);

  return (
    <Box width="100%"  minH="100vh" py={8} px={4}>
      <VStack spacing={6} align="stretch" maxWidth="1400px" mx="auto">
        <Flex justifyContent="space-between" alignItems="center">
          <Button
            leftIcon={<ChevronLeftIcon />}
            onClick={() => router.push('/guild-stats')}
            bg={accentColor}
            color={textColor}
            _hover={{ bg: 'red.900' }}
          >
            Voltar para Estatísticas da Guilda
          </Button>
        </Flex>
        <Heading color={textColor}>{characterName || 'Jogador Desconhecido'}</Heading>
        {loading ? (
          <VStack spacing={4}>
            <Spinner size="xl" color={accentColor} />
            <Text color={textColor}>Carregando...</Text>
          </VStack>
        ) : error ? (
          <Text color={accentColor}>{error}</Text>
        ) : characterName ? (
          <PlayerDashboard
            experienceData={experienceData}
            onlineHistory={onlineHistory}
            deathData={deathData}
          />
        ) : (
          <Text color={textColor}>Nenhum jogador selecionado</Text>
        )}
      </VStack>
    </Box>
  );
};

export default CharacterStatsPage;