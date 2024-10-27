import { Alert, AlertIcon, AlertTitle, AlertDescription, GridItem, Stat, StatLabel, StatNumber, StatHelpText,
  StatArrow, HStack, MenuButton, Button, MenuList, MenuItem, Thead, Tr, Th, Tbody, Td, VStack, Table, Text, Box, Grid, Menu } from "@chakra-ui/react";
import { useState, useMemo, useEffect } from "react";
import { ExperienceDataItem } from "../../../../../shared/interface/guild/guild-stats-experience-history.interface";
import { OnlineTimeDay, PlayerDeaths } from "../../../../../shared/interface/guild/guild-stats-player.interface";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PlayerDashboardProps {
  experienceData: ExperienceDataItem[];
  onlineHistory: OnlineTimeDay[];
  deathData: PlayerDeaths | null;
}

const PlayerDashboard: React.FC<PlayerDashboardProps> = ({ experienceData, onlineHistory, deathData }) => {
  const [selectedDate, setSelectedDate] = useState('');

  const bgColor = 'bg-gray-900';
  const cardBgColor = 'bg-gray-900';
  const textColor = 'text-white';
  const accentColor = 'text-red-500';

  const expChartColor = '#ff6384';
  const levelChartColor = '#36a2eb';
  const timeChartColor = '#4bc0c0';

  const hasExperienceData = experienceData && experienceData.length > 0;
  const hasOnlineHistory = onlineHistory && onlineHistory.length > 0;
  const hasDeathData = deathData && deathData.deaths && deathData.deaths.length > 0;

  const sortedHistory = useMemo(() => {
    if (!hasOnlineHistory) return [];
    return [...onlineHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [onlineHistory, hasOnlineHistory]);

  useEffect(() => {
    if (sortedHistory.length > 0) {
      setSelectedDate(sortedHistory[0].date);
    }
  }, [sortedHistory]);

  const formatLargeNumber = (num: number): string => {
    if (!num) return '0';
    return num >= 1000000 ? `${(num / 1000000).toFixed(2)}M` :
           num >= 1000 ? `${(num / 1000).toFixed(2)}K` :
           num.toFixed(0);
  };

  const latestExp = hasExperienceData ? experienceData[experienceData.length - 1] : null;

  const EmptyStateCard = ({ title, message }: { title: string; message: string }) => (
    <Box className={`${cardBgColor} p-4 rounded-md`}>
      <Alert variant="left-accent" status="info" className="bg-blue-900 border-blue-500">
        <AlertIcon />
        <Box>
          <AlertTitle className={textColor}>{title}</AlertTitle>
          <AlertDescription className={textColor}>{message}</AlertDescription>
        </Box>
      </Alert>
    </Box>
  );

  const StatsGrid = () => {
    if (!hasExperienceData) {
      return (
        <EmptyStateCard
          title="Sem dados de experiência"
          message="Nenhum dado de experiência disponível para este jogador ainda."
        />
      );
    }

    return (
      <Grid className="grid grid-cols-4 gap-4">
        <GridItem>
          <Box className={`${cardBgColor} p-4 rounded-md`}>
            <Stat>
              <StatLabel className={textColor}>Nível Atual</StatLabel>
              <StatNumber className={accentColor}>{latestExp?.level || 'N/A'}</StatNumber>
              {latestExp?.level_change && (
                <StatHelpText className={textColor}>
                  <StatArrow type={latestExp.level_change > 0 ? 'increase' : 'decrease'} />
                  {latestExp.level_change}
                </StatHelpText>
              )}
            </Stat>
          </Box>
        </GridItem>

        <GridItem>
          <Box className={`${cardBgColor} p-4 rounded-md`}>
            <Stat>
              <StatLabel className={textColor}>Experiência Total</StatLabel>
              <StatNumber className={accentColor}>{formatLargeNumber(latestExp?.experience || 0)}</StatNumber>
              {latestExp?.exp_change && (
                <StatHelpText className={textColor}>
                  <StatArrow type={latestExp.exp_change > 0 ? 'increase' : 'decrease'} />
                  {formatLargeNumber(latestExp.exp_change)}
                </StatHelpText>
              )}
            </Stat>
          </Box>
        </GridItem>

        <GridItem>
          <Box className={`${cardBgColor} p-4 rounded-md`}>
            <Stat>
              <StatLabel className={textColor}>Média Exp/Hora</StatLabel>
              <StatNumber className={accentColor}>
                {formatLargeNumber(latestExp?.average_experience_per_hour || 0)}
              </StatNumber>
            </Stat>
          </Box>
        </GridItem>

        <GridItem>
          <Box className={`${cardBgColor} p-4 rounded-md`}>
            <Stat>
              <StatLabel className={textColor}>Tempo Online (Último)</StatLabel>
              <StatNumber className={accentColor}>{latestExp?.time_online || 'N/A'}</StatNumber>
            </Stat>
          </Box>
        </GridItem>
      </Grid>
    );
  };

  const ExperienceChart = () => {
    if (!hasExperienceData) return null;

    const chartData = experienceData.map(data => ({
      date: new Date(data.date).toLocaleDateString('pt-BR'),
      experience: data.experience,
      level: data.level
    }));

    return (
      <Box className={`${cardBgColor} p-4 rounded-md h-[450px]`}>
        <Text className={`${textColor} font-bold text-lg mb-4 text-center`}>
          Progresso de Experiência e Nível
        </Text>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="white" angle={-45} textAnchor="end" height={60} />
            <YAxis yAxisId="left" stroke="white" tickFormatter={formatLargeNumber} />
            <YAxis yAxisId="right" orientation="right" stroke="white" />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none' }}
              labelStyle={{ color: 'white' }}
              formatter={(value: number) => formatLargeNumber(value)}
            />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="experience" stroke={expChartColor} name="Experiência Total" />
            <Line yAxisId="right" type="monotone" dataKey="level" stroke={levelChartColor} name="Nível" />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  const OnlineTimeChart = () => {
    if (!hasOnlineHistory) return null;

    const selectedDay = sortedHistory.find(day => day.date === selectedDate);
    const hourlyData = new Array(24).fill(0).map((_, index) => ({
      hour: `${index.toString().padStart(2, '0')}:00`,
      onlineTime: 0
    }));

    if (selectedDay?.online_time_messages) {
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

    return (
      <Box className={`${cardBgColor} p-4 rounded-md h-[450px]`}>
        <HStack className="justify-between mb-4">
          <Text className={`${textColor} font-bold text-lg`}>Tempo Online por Hora</Text>
          <Menu>
            <MenuButton as={Button} className={`${bgColor} ${textColor}`}>
              {new Date(selectedDate).toLocaleDateString('pt-BR')}
            </MenuButton>
            <MenuList className={`${bgColor} max-h-[200px] overflow-y-auto`}>
              {sortedHistory.map(day => (
                <MenuItem
                  key={day.date}
                  onClick={() => setSelectedDate(day.date)}
                  className={`${bgColor} ${textColor} hover:${cardBgColor}`}
                >
                  {new Date(day.date).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  - Total: {day.total_online_time_str}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </HStack>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="hour" stroke="white" />
            <YAxis stroke="white" tickFormatter={(value) => `${value}h`} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none' }}
              labelStyle={{ color: 'white' }}
              formatter={(value: number) => `${value.toFixed(2)} horas`}
            />
            <Legend />
            <Bar dataKey="onlineTime" fill={timeChartColor} name="Tempo Online" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  const DeathsTable = () => {
    if (!hasDeathData) {
      return (
        <EmptyStateCard
          title="Sem histórico de mortes"
          message="Nenhuma morte registrada para este jogador."
        />
      );
    }

    return (
      <Box className={`${cardBgColor} p-4 rounded-md`}>
        <Text className={`${textColor} font-bold mb-2`}>Histórico de Mortes</Text>
        <Table>
          <Thead>
            <Tr>
              <Th className={textColor}>Data</Th>
              <Th className={textColor}>Nível</Th>
              <Th className={textColor}>Morto por</Th>
              <Th className={textColor}>Descrição</Th>
            </Tr>
          </Thead>
          <Tbody>
            {deathData.deaths.slice(0, 5).map((death, index) => (
              <Tr key={index}>
                <Td className={textColor}>{new Date(death.date).toLocaleDateString('pt-BR')}</Td>
                <Td className={textColor}>{death.text.match(/Level (\d+)/)?.[1] || 'N/A'}</Td>
                <Td className={textColor}>{death.killers[0]}</Td>
                <Td className={textColor}>{death.text}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    );
  };

  return (
    <VStack className="space-y-6">
      <StatsGrid />

      {(!hasExperienceData && !hasOnlineHistory) ? (
        <EmptyStateCard
          title="Sem dados de progresso"
          message="Não há dados de experiência ou tempo online disponíveis para este jogador."
        />
      ) : (
        <Grid className="grid grid-cols-2 gap-6">
          {hasExperienceData && <GridItem><ExperienceChart /></GridItem>}
          {hasOnlineHistory && <GridItem><OnlineTimeChart /></GridItem>}
        </Grid>
      )}

      <DeathsTable />
    </VStack>
  );
};

export default PlayerDashboard;