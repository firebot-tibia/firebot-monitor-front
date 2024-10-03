import React, { useState, useMemo } from 'react';
import { Box, Text, VStack, Select, Tooltip, Flex, useColorModeValue } from '@chakra-ui/react';
import { Bar } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import { OnlineTimeDay } from '../../../../../shared/interface/guild/guild-stats-player.interface';

interface OnlineTimeChartProps {
  onlineHistory: OnlineTimeDay[];
}

const OnlineTimeChart: React.FC<OnlineTimeChartProps> = ({ onlineHistory }) => {
  const sortedHistory = useMemo(() => {
    return [...onlineHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [onlineHistory]);

  const [selectedDate, setSelectedDate] = useState<string>(sortedHistory[0]?.date || '');

  const bgColor = useColorModeValue('gray.900', 'gray.900');
  const textColor = useColorModeValue('white', 'white');
  const chartColor = useColorModeValue('rgba(75, 192, 192, 0.6)', 'rgba(75, 192, 192, 0.6)');

  const dateOptions = useMemo(() => {
    return sortedHistory.map(day => {
      const date = new Date(day.date);
      return {
        value: day.date,
        label: `${date.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - Total: ${day.total_online_time_str}`
      };
    });
  }, [sortedHistory]);

  const prepareHourlyData = (date: string) => {
    const hourlyData = new Array(24).fill(0);
    const selectedDay = sortedHistory.find(day => day.date === date);
    if (selectedDay && selectedDay.online_time_messages) {
      selectedDay.online_time_messages.forEach(message => {
        const startHour = new Date(message.start_time).getHours();
        const endHour = new Date(message.end_time).getHours();
        const duration = parseFloat(message.duration);
        
        if (startHour === endHour) {
          hourlyData[startHour] += duration;
        } else {
          const hoursSpanned = (endHour - startHour + 24) % 24 || 24;
          const timePerHour = duration / hoursSpanned;
          for (let i = 0; i < hoursSpanned; i++) {
            const hour = (startHour + i) % 24;
            hourlyData[hour] += timePerHour;
          }
        }
      });
    }
    return hourlyData;
  };

  const hourlyData = prepareHourlyData(selectedDate);
  const selectedDay = sortedHistory.find(day => day.date === selectedDate);

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Tempo Online (horas)',
          color: textColor,
        },
        ticks: {
          color: textColor,
        }
      },
      x: {
        ticks: {
          color: textColor,
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            return `Tempo Online: ${context.parsed.y.toFixed(2)} horas`;
          }
        }
      },
      legend: {
        display: false
      }
    }
  };

  return (
    <VStack spacing={4} align="center" bg={bgColor} p={6} borderRadius="lg">
      <Flex direction="column" align="center" width="100%" maxWidth="600px">
        <Select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          size="lg"
          mb={2}
          color={textColor}
          bg={bgColor}
        >
          {dateOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Tooltip label="Tempo total online para o dia selecionado">
          <Text fontWeight="bold" textAlign="center" color={textColor}>
            Tempo Online Total: {selectedDay?.total_online_time_str || '0h'}
          </Text>
        </Tooltip>
      </Flex>
      <Box height="400px" width="100%" maxWidth="800px">
        <Bar
          data={{
            labels: Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`),
            datasets: [{
              label: 'Tempo Online',
              data: hourlyData,
              backgroundColor: chartColor,
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }]
          }}
          options={chartOptions}
        />
      </Box>
    </VStack>
  );
};

export default OnlineTimeChart;