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
  HStack,
  Box,
  Stat,
  StatLabel,
  StatNumber,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
} from '@chakra-ui/react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { getPlayerOnlineHistory, getPlayersLifeTimeDeaths } from '../../../services/guilds';
import { PlayerModalProps, OnlineTimeDay, PlayerDeaths, DeathData } from '../../../shared/interface/guild-stats-player.interface';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const PlayerModal: React.FC<PlayerModalProps> = ({ isOpen, onClose, characterName }) => {
  const [onlineHistory, setOnlineHistory] = useState<OnlineTimeDay[]>([]);
  const [deathData, setDeathData] = useState<PlayerDeaths | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bgColor = useColorModeValue('gray.800', 'gray.900');
  const textColor = useColorModeValue('gray.100', 'gray.50');
  const lineColor = useColorModeValue('#68D391', '#38A169');

  useEffect(() => {
    const fetchData = async () => {
      if (characterName) {
        try {
          setLoading(true);
          setError(null);
          const [onlineData, deathsData] = await Promise.all([
            getPlayerOnlineHistory({ character: characterName }),
            getPlayersLifeTimeDeaths({ character: characterName })
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

  const prepareWeeklyData = () => {
    const weeklyData = (onlineHistory || []).slice(0, 7).map(day => ({
      date: new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'short' }),
      onlineTime: day.total_online_time / 3600,
    }));
    return weeklyData.reverse();
  };

  const renderDeathsTable = () => {
    if (!deathData || !Array.isArray(deathData.deaths) || deathData.deaths.length === 0) {
      return <Text>Nenhum dado de morte disponível.</Text>;
    }

    return (
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Data</Th>
            <Th>Nível</Th>
            <Th>Assassinos</Th>
            <Th>Descrição</Th>
          </Tr>
        </Thead>
        <Tbody>
          {deathData.deaths.map((death: DeathData, index: number) => (
            <Tr key={index}>
              <Td>{new Date(death.date).toLocaleDateString('pt-BR')}</Td>
              <Td>{death.text.match(/Level (\d+)/)?.[1] || 'N/A'}</Td>
              <Td>{death.killers.slice(0, 3).join(', ')}{death.killers.length > 3 ? ` e mais ${death.killers.length - 3}` : ''}</Td>
              <Td>{death.text}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent maxWidth="90vw" bg={bgColor} color={textColor}>
        <ModalHeader>{characterName}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <VStack spacing={4}>
              <Spinner size="xl" />
              <Text>Carregando...</Text>
            </VStack>
          ) : error ? (
            <Text color="red.500">{error}</Text>
          ) : (
            <Tabs variant="soft-rounded" colorScheme="green">
              <TabList>
                <Tab>Informações Gerais</Tab>
                <Tab>Histórico Online</Tab>
                <Tab>Histórico de Mortes</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Stat>
                        <StatLabel>Mortes (Último Dia)</StatLabel>
                        <StatNumber>{deathData?.last_day || 0}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Mortes (Última Semana)</StatLabel>
                        <StatNumber>{deathData?.last_week || 0}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Mortes (Último Mês)</StatLabel>
                        <StatNumber>{deathData?.last_month || 0}</StatNumber>
                      </Stat>
                    </HStack>
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <Box height="300px" width="100%">
                    <Text fontWeight="bold" mb={2}>Tempo Online (Últimos 7 Dias)</Text>
                    <Line
                      data={{
                        labels: prepareWeeklyData().map(d => d.date),
                        datasets: [{
                          label: 'Horas Online',
                          data: prepareWeeklyData().map(d => d.onlineTime),
                          borderColor: lineColor,
                          tension: 0.1
                        }]
                      }}
                      options={{
                        responsive: true,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Horas'
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                </TabPanel>

                <TabPanel>
                  {renderDeathsTable()}
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PlayerModal;