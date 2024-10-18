import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, VStack, HStack, Text, Stat, StatLabel, StatNumber, StatHelpText, StatArrow,
  Grid, GridItem, Table, Thead, Tbody, Tr, Th, Td,
  useColorModeValue,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList
} from '@chakra-ui/react';

import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import { ExperienceDataItem } from '../../../../../shared/interface/guild/guild-stats-experience-history.interface';
import { OnlineTimeDay, PlayerDeaths } from '../../../../../shared/interface/guild/guild-stats-player.interface';


interface PlayerDashboardProps {
  experienceData: ExperienceDataItem[];
  onlineHistory: OnlineTimeDay[];
  deathData: PlayerDeaths | null;
}

const PlayerDashboard: React.FC<PlayerDashboardProps> = ({ experienceData, onlineHistory, deathData }) => {
  const [selectedDate, setSelectedDate] = useState('');

  const bgColor = useColorModeValue('gray.900', 'gray.900');
  const cardBgColor = useColorModeValue('gray.900', 'gray.900');
  const textColor = useColorModeValue('white', 'white');
  const accentColor = useColorModeValue('red.500', 'red.500');

  const expChartColor = '#ff6384';
  const levelChartColor = '#36a2eb';
  const timeChartColor = '#4bc0c0';

  const sortedHistory = useMemo(() => {
    return [...onlineHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [onlineHistory]);

  useEffect(() => {
    if (sortedHistory.length > 0) {
      setSelectedDate(sortedHistory[0].date);
    }
  }, [sortedHistory]);

  const formatLargeNumber = (num: number): string => {
    return num >= 1000000 ? `${(num / 1000000).toFixed(2)}M` :
           num >= 1000 ? `${(num / 1000).toFixed(2)}K` :
           num.toFixed(0);
  };

  const latestExp = experienceData[experienceData.length - 1];

  const prepareExperienceChartData = () => {
    return experienceData.map(data => ({
      date: new Date(data.date).toLocaleDateString('pt-BR'),
      experience: data.experience,
      level: data.level
    }));
  };

  const prepareOnlineTimeChartData = () => {
    const selectedDay = sortedHistory.find(day => day.date === selectedDate);
    const hourlyData = new Array(24).fill(0).map((_, index) => ({
      hour: `${index.toString().padStart(2, '0')}:00`,
      onlineTime: 0
    }));

    if (selectedDay && selectedDay.online_time_messages) {
      selectedDay.online_time_messages.forEach(message => {
        const startTime = new Date(message.start_time);
        const endTime = new Date(message.end_time);
        const startHour = startTime.getHours();
        const endHour = endTime.getHours();
        const duration = (endTime.getTime() - startTime.getTime()) / 3600000;

        if (startHour === endHour) {
          hourlyData[startHour].onlineTime += duration;
        } else {
          for (let hour = startHour; hour <= endHour; hour++) {
            if (hour === startHour) {
              hourlyData[hour].onlineTime += (60 - startTime.getMinutes()) / 60;
            } else if (hour === endHour) {
              hourlyData[hour].onlineTime += endTime.getMinutes() / 60;
            } else {
              hourlyData[hour].onlineTime += 1;
            }
          }
        }
      });
    }

    return hourlyData;
  };

  const dateOptions = useMemo(() => {
    return sortedHistory.map(day => {
      const date = new Date(day.date);
      return {
        value: day.date,
        label: `${date.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - Total: ${day.total_online_time_str}`
      };
    });
  }, [sortedHistory]);

  return (

      <VStack spacing={6} align="stretch">
        <Grid templateColumns="repeat(4, 1fr)" gap={4}>
          <GridItem>
            <Box bg={cardBgColor} p={4} borderRadius="md">
              <Stat>
                <StatLabel color={textColor}>Nível Atual</StatLabel>
                <StatNumber color={accentColor}>{latestExp.level}</StatNumber>
                <StatHelpText color={textColor}>
                  <StatArrow type={latestExp.level_change > 0 ? 'increase' : 'decrease'} />
                  {latestExp.level_change}
                </StatHelpText>
              </Stat>
            </Box>
          </GridItem>
          <GridItem>
            <Box bg={cardBgColor} p={4} borderRadius="md">
              <Stat>
                <StatLabel color={textColor}>Experiência Total</StatLabel>
                <StatNumber color={accentColor}>{formatLargeNumber(latestExp.experience)}</StatNumber>
                <StatHelpText color={textColor}>
                  <StatArrow type={latestExp.exp_change > 0 ? 'increase' : 'decrease'} />
                  {formatLargeNumber(latestExp.exp_change)}
                </StatHelpText>
              </Stat>
            </Box>
          </GridItem>
          <GridItem>
            <Box bg={cardBgColor} p={4} borderRadius="md">
              <Stat>
                <StatLabel color={textColor}>Média Exp/Hora</StatLabel>
                <StatNumber color={accentColor}>{formatLargeNumber(latestExp.average_experience_per_hour)}</StatNumber>
              </Stat>
            </Box>
          </GridItem>
          <GridItem>
            <Box bg={cardBgColor} p={4} borderRadius="md">
              <Stat>
                <StatLabel color={textColor}>Tempo Online (Último)</StatLabel>
                <StatNumber color={accentColor}>{latestExp.time_online}</StatNumber>
              </Stat>
            </Box>
          </GridItem>
        </Grid>

        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <GridItem>
          <Box bg={cardBgColor} p={4} borderRadius="md" height="450px">
            <Text fontWeight="bold" fontSize="lg" color={textColor} mb={4} textAlign="center">
              Progresso de Experiência e Nível
            </Text>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={prepareExperienceChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke={textColor} angle={-45} textAnchor="end" height={60} />
                <YAxis yAxisId="left" stroke={textColor} tickFormatter={formatLargeNumber} />
                <YAxis yAxisId="right" orientation="right" stroke={textColor} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none' }}
                  labelStyle={{ color: textColor }}
                  formatter={(value: number) => formatLargeNumber(value)}
                />
                <Legend wrapperStyle={{ color: textColor }} />
                <Line yAxisId="left" type="monotone" dataKey="experience" stroke={expChartColor} name="Experiência Total" />
                <Line yAxisId="right" type="monotone" dataKey="level" stroke={levelChartColor} name="Nível" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </GridItem>
        <GridItem>
          <Box bg={cardBgColor} p={4} borderRadius="md" height="450px">
            <HStack justify="space-between" mb={4}>
              <Text fontWeight="bold" fontSize="lg" color={textColor}>Tempo Online por Hora</Text>
              <Menu>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bg={bgColor} color={textColor}>
                  {new Date(selectedDate).toLocaleDateString('pt-BR')}
                </MenuButton>
                <MenuList bg={bgColor} borderColor={cardBgColor} maxH="200px" overflowY="auto">
                  {dateOptions.map(option => (
                    <MenuItem
                      key={option.value}
                      value={option.value}
                      onClick={() => setSelectedDate(option.value)}
                      bg={bgColor}
                      color={textColor}
                      _hover={{ bg: cardBgColor }}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </HStack>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={prepareOnlineTimeChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="hour" stroke={textColor} />
                <YAxis stroke={textColor} tickFormatter={(value) => `${value}h`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none' }}
                  labelStyle={{ color: textColor }}
                  formatter={(value: number) => `${value.toFixed(2)} horas`}
                />
                <Legend wrapperStyle={{ color: textColor }} />
                <Bar dataKey="onlineTime" fill={timeChartColor} name="Tempo Online" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </GridItem>
      </Grid>

        <Box bg={cardBgColor} p={4} borderRadius="md">
          <Text fontWeight="bold" mb={2} color={textColor}>Histórico de Mortes</Text>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th color={textColor}>Data</Th>
                <Th color={textColor}>Nível</Th>
                <Th color={textColor}>Morto por</Th>
                <Th color={textColor}>Descrição</Th>
              </Tr>
            </Thead>
            <Tbody>
              {deathData?.deaths.slice(0, 5).map((death, index) => (
                <Tr key={index}>
                  <Td color={textColor}>{new Date(death.date).toLocaleDateString('pt-BR')}</Td>
                  <Td color={textColor}>{death.text.match(/Level (\d+)/)?.[1] || 'N/A'}</Td>
                  <Td color={textColor}>{death.killers[0]}</Td>
                  <Td color={textColor}>{death.text}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
  );
};

export default PlayerDashboard;