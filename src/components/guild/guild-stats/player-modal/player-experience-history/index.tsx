import React, { useEffect, useState } from 'react';
import {
  Box, VStack, Text, Stat, StatLabel, StatNumber, StatHelpText, StatArrow,
  useColorModeValue, Spinner, Center, Grid, GridItem, Tooltip
} from '@chakra-ui/react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip as ChartTooltip, Legend, ChartData, ChartOptions
} from 'chart.js';
import { getPlayerExperienceHistory } from '../../../../../services/guilds';
import { PlayerExperienceProps, ExperienceDataItem } from '../../../../../shared/interface/guild-stats-experience-history.interface';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, ChartTooltip, Legend
);

const PlayerExperience: React.FC<PlayerExperienceProps> = ({ characterName }) => {
  const [experienceData, setExperienceData] = useState<ExperienceDataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const bgColor = useColorModeValue('gray.900', 'gray.900');
  const cardBgColor = useColorModeValue('gray.800', 'gray.800');
  const textColor = useColorModeValue('white', 'white');
  const lineColor = useColorModeValue('#68D391', '#68D391');
  const barColor = useColorModeValue('#4299E1', '#4299E1');

  useEffect(() => {
    const fetchExperienceData = async () => {
      try {
        setLoading(true);
        const response = await getPlayerExperienceHistory({ character: characterName });
        setExperienceData(response.experience_history.character_experience_messages);   
      } catch (err) {
        console.error('Error fetching experience data:', err);
        setError('Falha ao buscar dados de experiência');
      } finally {
        setLoading(false);
      }
    };
    fetchExperienceData();
  }, [characterName]);

  if (loading) {
    return (
      <Center height="200px">
        <Spinner size="xl" color="blue.500" />
        <Text ml={4} color={textColor}>Carregando dados de experiência...</Text>
      </Center>
    );
  }

  if (error || experienceData.length === 0) {
    return <Text color="red.500">{error || 'Nenhum dado de experiência disponível'}</Text>;
  }

  const latestData = experienceData[experienceData.length - 1];
  const firstData = experienceData[0];

  const totalExpGained = latestData.experience - firstData.experience;
  const totalLevelsGained = latestData.level - firstData.level;
  const totalDays = experienceData.length;

  const avgExpPerDay = totalExpGained / totalDays;
  const avgLevelPerDay = totalLevelsGained / totalDays;

  const formatLargeNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    } else {
      return num.toFixed(0);
    }
  };

  const prepareLineChartData = (): ChartData<'line'> => ({
    labels: experienceData.map(data => new Date(data.date).toLocaleDateString('pt-BR')),
    datasets: [
      {
        label: 'Experiência Total',
        data: experienceData.map(data => data.experience),
        borderColor: lineColor,
        tension: 0.1,
        yAxisID: 'y'
      },
      {
        label: 'Nível',
        data: experienceData.map(data => data.level),
        borderColor: barColor,
        tension: 0.1,
        yAxisID: 'y1'
      }
    ]
  });

  const prepareBarChartData = (): ChartData<'bar'> => ({
    labels: experienceData.map(data => new Date(data.date).toLocaleDateString('pt-BR')),
    datasets: [
      {
        label: 'Experiência Ganha',
        data: experienceData.map(data => data.exp_change),
        backgroundColor: barColor,
        yAxisID: 'y'
      },
      {
        label: 'Tempo Online (horas)',
        data: experienceData.map(data => parseFloat(data.time_online.split('h')[0])),
        backgroundColor: lineColor,
        yAxisID: 'y1'
      }
    ]
  });

  const chartOptions: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Experiência',
          color: textColor,
        },
        ticks: {
          color: textColor,
          callback: (value) => formatLargeNumber(Number(value)),
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Nível / Tempo Online',
          color: textColor,
        },
        ticks: {
          color: textColor,
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        ticks: {
          color: textColor,
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: textColor,
        },
      },
      tooltip: {
        titleColor: textColor,
        bodyColor: textColor,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.dataset.label === 'Experiência Total') {
                label += formatLargeNumber(context.parsed.y);
              } else {
                label += context.parsed.y;
              }
            }
            return label;
          }
        }
      }
    }
  };

  return (
    <VStack spacing={8} align="stretch" bg={bgColor} p={6} borderRadius="lg">
      <Grid templateColumns="repeat(4, 1fr)" gap={6}>
        <GridItem colSpan={1}>
          <Tooltip label={`Ganho total de níveis: ${totalLevelsGained}, Média diária: ${avgLevelPerDay.toFixed(2)}`}>
            <Box bg={cardBgColor} p={4} borderRadius="md" boxShadow="md">
              <Stat>
                <StatLabel color={textColor}>Nível Atual</StatLabel>
                <StatNumber color={textColor}>{latestData.level}</StatNumber>
                <StatHelpText color={textColor}>
                  <StatArrow type={latestData.level_change > 0 ? 'increase' : 'decrease'} />
                  {latestData.level_change}
                </StatHelpText>
              </Stat>
            </Box>
          </Tooltip>
        </GridItem>
        <GridItem colSpan={1}>
          <Tooltip label={`Ganho total de exp: ${formatLargeNumber(totalExpGained)}, Média diária: ${formatLargeNumber(avgExpPerDay)}`}>
            <Box bg={cardBgColor} p={4} borderRadius="md" boxShadow="md">
              <Stat>
                <StatLabel color={textColor}>Experiência Total</StatLabel>
                <StatNumber color={textColor}>{formatLargeNumber(latestData.experience)}</StatNumber>
                <StatHelpText color={textColor}>
                  <StatArrow type={latestData.exp_change > 0 ? 'increase' : 'decrease'} />
                  {formatLargeNumber(latestData.exp_change)}
                </StatHelpText>
              </Stat>
            </Box>
          </Tooltip>
        </GridItem>
        <GridItem colSpan={1}>
          <Tooltip label={`Média calculada com base no tempo online diário`}>
            <Box bg={cardBgColor} p={4} borderRadius="md" boxShadow="md">
              <Stat>
                <StatLabel color={textColor}>Média Exp/Hora</StatLabel>
                <StatNumber color={textColor}>{formatLargeNumber(latestData.average_experience_per_hour)}</StatNumber>
              </Stat>
            </Box>
          </Tooltip>
        </GridItem>
        <GridItem colSpan={1}>
          <Tooltip label={`Tempo online do último dia registrado`}>
            <Box bg={cardBgColor} p={4} borderRadius="md" boxShadow="md">
              <Stat>
                <StatLabel color={textColor}>Tempo Online</StatLabel>
                <StatNumber color={textColor}>{latestData.time_online}</StatNumber>
              </Stat>
            </Box>
          </Tooltip>
        </GridItem>
      </Grid>
      
      <Grid templateColumns="repeat(2, 1fr)" gap={8}>
        <GridItem colSpan={1}>
          <Box bg={cardBgColor} p={6} borderRadius="md" boxShadow="lg" height="450px">
            <Text fontWeight="bold" mb={4} fontSize="lg" color={textColor}>Progresso de Experiência e Nível</Text>
            <Box height="calc(100% - 40px)">
              <Line data={prepareLineChartData()} options={chartOptions} />
            </Box>
          </Box>
        </GridItem>
        <GridItem colSpan={1}>
          <Box bg={cardBgColor} p={6} borderRadius="md" boxShadow="lg" height="450px">
            <Text fontWeight="bold" mb={4} fontSize="lg" color={textColor}>Experiência Ganha e Tempo Online por Dia</Text>
            <Box height="calc(100% - 40px)">
              <Bar data={prepareBarChartData()} options={chartOptions} />
            </Box>
          </Box>
        </GridItem>
      </Grid>

      <Box bg={cardBgColor} p={6} borderRadius="md" boxShadow="lg">
        <Text fontWeight="bold" mb={4} fontSize="xl" textAlign="center" color={textColor}>Resumo do Período ({totalDays} dias)</Text>
        <Grid templateColumns="repeat(4, 1fr)" gap={6}>
          <GridItem>
            <Stat>
              <StatLabel color={textColor}>Experiência Total Ganha</StatLabel>
              <StatNumber fontSize="2xl" color={lineColor}>
                {formatLargeNumber(totalExpGained)}
              </StatNumber>
            </Stat>
          </GridItem>
          <GridItem>
            <Stat>
              <StatLabel color={textColor}>Níveis Ganhos</StatLabel>
              <StatNumber fontSize="2xl" color={barColor}>
                {totalLevelsGained}
              </StatNumber>
            </Stat>
          </GridItem>
          <GridItem>
            <Stat>
              <StatLabel color={textColor}>Média de Exp/Dia</StatLabel>
              <StatNumber fontSize="2xl" color={lineColor}>
                {formatLargeNumber(avgExpPerDay)}
              </StatNumber>
            </Stat>
          </GridItem>
          <GridItem>
            <Stat>
              <StatLabel color={textColor}>Média de Níveis/Dia</StatLabel>
              <StatNumber fontSize="2xl" color={barColor}>
                {avgLevelPerDay.toFixed(2)}
              </StatNumber>
            </Stat>
          </GridItem>
        </Grid>
      </Box>
    </VStack>
  );
};

export default PlayerExperience;