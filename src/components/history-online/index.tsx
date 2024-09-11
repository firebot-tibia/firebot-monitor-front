import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Heading,
  Select,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getPlayerOnlineHistory } from '../../services/guilds';

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

interface PlayerOnlineHistoryProps {
  characterName: string;
}

const PlayerOnlineHistory: React.FC<PlayerOnlineHistoryProps> = ({ characterName }) => {
  const [onlineHistory, setOnlineHistory] = useState<OnlineTimeDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('');

  useEffect(() => {
    const fetchOnlineHistory = async () => {
      try {
        setLoading(true);
        const data = await getPlayerOnlineHistory({ character: characterName });
        setOnlineHistory(data.online_time.online_time_days);
        if (data.online_time.online_time_days.length > 0) {
          const sortedDays = [...data.online_time.online_time_days].sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          setSelectedDay(sortedDays[sortedDays.length - 1].date);
        }
      } catch (err) {
        setError('Failed to fetch online history');
      } finally {
        setLoading(false);
      }
    };

    fetchOnlineHistory();
  }, [characterName]);

  const sortedOnlineHistory = useMemo(() => {
    return [...onlineHistory].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [onlineHistory]);

  const prepareChartData = (day: OnlineTimeDay) => {
    const data = new Array(24).fill(0).map((_, index) => ({
      hour: index,
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

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <Text color="red.500">{error}</Text>;
  }

  const selectedDayData = onlineHistory.find(day => day.date === selectedDay);

  return (
    <VStack spacing={4} align="stretch">
      <Heading size="md">Histórico de Tempo Online de {characterName}</Heading>
      <Select
        value={selectedDay}
        onChange={(e) => setSelectedDay(e.target.value)}
      >
        {sortedOnlineHistory.map(day => (
          <option key={day.date} value={day.date}>
            {new Date(day.date).toLocaleDateString()} - Total: {day.total_online_time_str}
          </option>
        ))}
      </Select>
      {selectedDayData && (
        <Box height="400px">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={prepareChartData(selectedDayData)}>
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="online" fill="#8884d8" name="Online Status" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </VStack>
  );
};

export default PlayerOnlineHistory;