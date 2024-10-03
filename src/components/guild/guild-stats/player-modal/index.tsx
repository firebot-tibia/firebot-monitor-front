import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { getPlayerOnlineHistory, getPlayersLifeTimeDeaths } from '../../../../services/guilds';
import { PlayerModalProps, OnlineTimeDay, PlayerDeaths } from '../../../../shared/interface/guild/guild-stats-player.interface';
import OnlineTimeChart from './online-time-chart';
import PlayerExperience from './player-experience-history';
import DeathHistory from './death-history';

const PlayerModal: React.FC<PlayerModalProps> = ({ isOpen, onClose, characterName }) => {
  const [onlineHistory, setOnlineHistory] = useState<OnlineTimeDay[]>([]);
  const [deathData, setDeathData] = useState<PlayerDeaths | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bgColor = useColorModeValue('gray.900', 'gray.900');
  const textColor = useColorModeValue('gray.100', 'gray.100');

  useEffect(() => {
    const fetchData = async () => {
      if (characterName) {
        try {
          setLoading(true);
          setError(null);
          const [onlineData, deathsData] = await Promise.all([
            getPlayerOnlineHistory({ character: characterName }),
            getPlayersLifeTimeDeaths({ character: characterName }),
          ]);
          setOnlineHistory(onlineData.online_time.online_time_days || []);
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
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent maxWidth="90vw" bg={bgColor} color={textColor}>
        <ModalHeader>{characterName || 'Jogador Desconhecido'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <VStack spacing={4}>
              <Spinner size="xl" />
              <Text>Carregando...</Text>
            </VStack>
          ) : error ? (
            <Text color="red.500">{error}</Text>
          ) : characterName ? (
            <Tabs variant="soft-rounded" colorScheme="green">
              <TabList>
                <Tab>Histórico de Experiência</Tab>
                <Tab>Histórico de Tempo Online</Tab>
                <Tab>Histórico de Mortes</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <PlayerExperience characterName={characterName} />
                </TabPanel>

                <TabPanel>
                  <OnlineTimeChart onlineHistory={onlineHistory} />
                </TabPanel>

                <TabPanel>
                  <DeathHistory deathData={deathData} />
                </TabPanel>
              </TabPanels>
            </Tabs>
          ) : (
            <Text>Nenhum jogador selecionado</Text>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PlayerModal;