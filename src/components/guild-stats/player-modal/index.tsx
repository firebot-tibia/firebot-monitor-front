import React, { useState, useEffect, useMemo } from 'react';
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
  StatHelpText,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
} from '@chakra-ui/react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { getPlayerOnlineHistory } from '../../../services/guilds';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterName: string | null;
}

interface OnlineTimeMessage {
  duration: string;
  end_time: string;
  start_time: string;
}

interface OnlineTimeDay {
  date: string;
  online_time_messages: OnlineTimeMessage[] | null;
  total_online_time: number;
  total_online_time_str: string;
}

const PlayerModal: React.FC<PlayerModalProps> = ({ isOpen, onClose, characterName }) => {
  const [onlineHistory, setOnlineHistory] = useState<OnlineTimeDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('');

  const barColor = useColorModeValue('#3182CE', '#63B3ED');
  const lineColor = useColorModeValue('#38A169', '#68D391');
  const textColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    const fetchOnlineHistory = async () => {
      if (characterName) {
        try {
          setLoading(true);
          const data = await getPlayerOnlineHistory({ character: characterName });
          setOnlineHistory(data.online_time.online_time_days);
          if (data.online_time.online_time_days.length > 0) {
            const sortedDays = [...data.online_time.online_time_days].sort((a, b) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setSelectedDay(sortedDays[0].date);
          }
        } catch (err) {
          setError('Falha ao buscar histórico online');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOnlineHistory();
  }, [characterName]);

  const sortedOnlineHistory = useMemo(() => {
    return [...onlineHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [onlineHistory]);

  const prepareChartData = (day: OnlineTimeDay) => {
    const data = new Array(24).fill(0).map((_, index) => ({
      hour: index.toString().padStart(2, '0') + ':00',
      online: 0,
    }));

    if (day.online_time_messages) {
      day.online_time_messages.forEach(message => {
        const startHour = new Date(message.start_time).getUTCHours();
        const endHour = new Date(message.end_time).getUTCHours();
        for (let i = startHour; i <= endHour; i++) {
          data[i].online = 1;
        }
      });
    }

    return data;
  };

  const prepareWeeklyData = () => {
    const weeklyData = sortedOnlineHistory.slice(0, 7).map(day => ({
      date: new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'short' }),
      onlineTime: day.total_online_time / 3600, // Convert to hours
    }));
    return weeklyData.reverse();
  };

  const selectedDayData = onlineHistory.find(day => day.date === selectedDay);

  const playerInfo = {
    name: characterName,
    vocation: 'Knight',
    level: 250,
    deaths: {
      daily: 2,
      weekly: 5,
      monthly: 15
    },
  };

  const expData = {
    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'],
    datasets: [
      {
        label: 'Experiência Diária',
        data: Array.from({length: 30}, () => Math.floor(Math.random() * 1000000)),
        borderColor: lineColor,
        tension: 0.1
      }
    ]
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent maxWidth="90vw">
        <ModalHeader>{characterName}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Tabs>
            <TabList>
              <Tab>Informações Gerais</Tab>
              <Tab>Histórico Online</Tab>
              <Tab>Experiência</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text>Vocação: {playerInfo.vocation}</Text>
                    <Text>Nível: {playerInfo.level}</Text>
                  </HStack>
                  
                  <Box>
                    <Text fontWeight="bold">Mortes:</Text>
                    <HStack justify="space-between">
                      <Stat>
                        <StatLabel>Diária</StatLabel>
                        <StatNumber>{playerInfo.deaths.daily}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Semanal</StatLabel>
                        <StatNumber>{playerInfo.deaths.weekly}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Mensal</StatLabel>
                        <StatNumber>{playerInfo.deaths.monthly}</StatNumber>
                      </Stat>
                    </HStack>
                  </Box>
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    color={textColor}
                  >
                    {sortedOnlineHistory.map(day => (
                      <option key={day.date} value={day.date}>
                        {new Date(day.date).toLocaleDateString()} - Total: {day.total_online_time_str}
                      </option>
                    ))}
                  </Select>
                  {selectedDayData && (
                    <Box height="400px" width="100%">
                      <Bar
                        data={{
                          labels: prepareChartData(selectedDayData).map(d => d.hour),
                          datasets: [{
                            label: 'Status Online',
                            data: prepareChartData(selectedDayData).map(d => d.online),
                            backgroundColor: barColor,
                          }]
                        }}
                        options={{
                          responsive: true,
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: 1,
                              ticks: {
                                stepSize: 1,
                                callback: function(value) {
                                  if (value === 0) return 'Offline';
                                  if (value === 1) return 'Online';
                                  return '';
                                }
                              }
                            }
                          },
                          plugins: {
                            legend: {
                              display: false
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  return context.parsed.y === 1 ? 'Online' : 'Offline';
                                }
                              }
                            }
                          }
                        }}
                      />
                    </Box>
                  )}
                  <Box height="300px" width="100%">
                    <Text fontWeight="bold" mb={2}>Tempo Online nos Últimos 7 Dias</Text>
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
                </VStack>
              </TabPanel>

              <TabPanel>
                <Box height="400px" width="100%">
                  <Text fontWeight="bold" mb={2}>Gráfico de Experiência Mensal</Text>
                  <Line data={expData} options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: true,
                        text: 'Experiência Diária no Último Mês'
                      }
                    }
                  }} />
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PlayerModal;