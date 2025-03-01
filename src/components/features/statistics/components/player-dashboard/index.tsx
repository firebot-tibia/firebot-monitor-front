import React, { useEffect, useMemo, useState } from 'react'

import {
  Box,
  Button,
  Tooltip as ChakraTooltip,
  Grid,
  GridItem,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ClockIcon,
  StarIcon,
  TrendingUpIcon,
  ZapIcon,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { ExperienceDataItem } from '../../types/guild-stats-experience-history.interface'
import type { OnlineTimeDay } from '../../types/guild-stats-player.interface'
import type {
  ChartCardProps,
  CustomTooltipProps,
  PlayerDashboardProps,
  StatCardProps,
} from '../../types/player-dashboard.interface'

const COLORS = {
  primary: '#4F46E5',
  secondary: '#10B981',
  accent: '#F59E0B',
  danger: '#EF4444',
  background: {
    dark: '#111827',
    card: '#1F2937',
    hover: '#374151',
  },
  text: {
    primary: '#F9FAFB',
    secondary: '#D1D5DB',
    muted: '#9CA3AF',
  },
  chart: {
    experience: '#EC4899',
    level: '#3B82F6',
    online: '#10B981',
    grid: 'rgba(255, 255, 255, 0.1)',
  },
}

const MotionBox = motion(Box)

const LoadingSpinner: React.FC = () => (
  <Box className="flex h-64 items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-indigo-500" />
  </Box>
)

const EmptyState: React.FC<{ title: string; message: string }> = ({ title, message }) => (
  <Box className="rounded-xl border border-gray-700 bg-gray-900 py-12 text-center">
    <Text className="mb-2 text-xl font-semibold text-white">{title}</Text>
    <Text className="text-gray-400">{message}</Text>
  </Box>
)

const StatCard: React.FC<StatCardProps> = ({ title, value, change, suffix = '', icon: Icon }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <MotionBox
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={false}
      className="relative overflow-hidden rounded-xl"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Box
        className={`
          rounded-xl border border-gray-700 p-6 transition-all duration-200
          ${isHovered ? 'bg-gray-800' : 'bg-gray-900'}
        `}
      >
        <HStack spacing={4} className="mb-4">
          <Box
            className={`
              rounded-lg p-2 transition-colors duration-200
              ${isHovered ? 'bg-indigo-600' : 'bg-indigo-500/20'}
            `}
          >
            <Icon
              className={`
                h-5 w-5 transition-colors duration-200
                ${isHovered ? 'text-white' : 'text-indigo-500'}
              `}
            />
          </Box>
          <Text className="font-medium text-gray-400">{title}</Text>
        </HStack>

        <Box className="space-y-1">
          <Text className="text-3xl font-bold tracking-tight text-white">
            {value}
            {suffix}
          </Text>
          {change && (
            <HStack spacing={2}>
              {change > 0 ? (
                <ArrowUpIcon className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-red-500" />
              )}
              <Text className={change > 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(change)}
              </Text>
            </HStack>
          )}
        </Box>
      </Box>
    </MotionBox>
  )
}

const PlayerDashboard: React.FC<PlayerDashboardProps> = ({
  experienceData,
  onlineHistory,
  deathData,
}) => {
  const [selectedDate, setSelectedDate] = useState('')

  const hasExperienceData = experienceData && experienceData.length > 0
  const hasOnlineHistory = onlineHistory && onlineHistory.length > 0

  const sortedHistory = useMemo(() => {
    if (!hasOnlineHistory) return []
    return [...onlineHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
  }, [onlineHistory, hasOnlineHistory])

  useEffect(() => {
    if (sortedHistory.length > 0) {
      setSelectedDate(sortedHistory[0].date)
    }
  }, [sortedHistory])

  const formatLargeNumber = (num: number): string => {
    if (!num) return '0'
    return num >= 1000000
      ? `${(num / 1000000).toFixed(2)}M`
      : num >= 1000
        ? `${(num / 1000).toFixed(2)}K`
        : num.toFixed(0)
  }

  const latestExp = hasExperienceData ? experienceData[experienceData.length - 1] : null

  const ExperienceChart: React.FC<{
    data: ExperienceDataItem[]
    formatValue: (value: number) => string
  }> = ({ data, formatValue }) => {
    const [focusedDataIndex, setFocusedDataIndex] = useState<number | null>(null)

    const chartData = useMemo(
      () =>
        data.map(item => ({
          date: new Date(item.date).toLocaleDateString('pt-BR'),
          experience: item.experience,
          level: item.level,
          exp_change: item.exp_change,
          originalDate: item.date,
        })),
      [data],
    )

    return (
      <ChartCard title="Progresso de Experiência e Nível">
        <Box className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              onMouseMove={e => {
                if (e.activeTooltipIndex !== undefined) {
                  setFocusedDataIndex(e.activeTooltipIndex)
                }
              }}
              onMouseLeave={() => setFocusedDataIndex(null)}
            >
              <defs>
                <linearGradient id="expLine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.chart.experience} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={COLORS.chart.experience} stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="levelLine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.chart.level} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={COLORS.chart.level} stopOpacity={0.2} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chart.grid} />

              <XAxis
                dataKey="date"
                stroke={COLORS.text.secondary}
                tick={{ fill: COLORS.text.secondary }}
                angle={-45}
                textAnchor="end"
                height={60}
              />

              <YAxis
                yAxisId="left"
                stroke={COLORS.text.secondary}
                tick={{ fill: COLORS.text.secondary }}
                tickFormatter={formatValue}
              />

              <YAxis
                yAxisId="right"
                orientation="right"
                stroke={COLORS.text.secondary}
                tick={{ fill: COLORS.text.secondary }}
              />

              <Tooltip content={<CustomTooltip valueFormatter={formatValue} />} />

              <Legend />

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="experience"
                stroke={COLORS.chart.experience}
                strokeWidth={2}
                dot={(props: any) => {
                  const isFocused = focusedDataIndex === props.index
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={isFocused ? 6 : 4}
                      fill={COLORS.chart.experience}
                      strokeWidth={isFocused ? 2 : 0}
                      stroke="white"
                      className="transition-all duration-200"
                    />
                  )
                }}
                name="Experiência"
                animationDuration={1000}
              />

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="level"
                stroke={COLORS.chart.level}
                strokeWidth={2}
                dot={(props: any) => {
                  const isFocused = focusedDataIndex === props.index
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={isFocused ? 6 : 4}
                      fill={COLORS.chart.level}
                      strokeWidth={isFocused ? 2 : 0}
                      stroke="white"
                      className="transition-all duration-200"
                    />
                  )
                }}
                name="Nível"
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </ChartCard>
    )
  }

  const OnlineTimeChart: React.FC<{
    data: OnlineTimeDay[]
    selectedDate: string
    onDateChange: (date: string) => void
  }> = ({ data, selectedDate, onDateChange }) => {
    const [hoveredBar, setHoveredBar] = useState<string | null>(null)
    const [animationComplete, setAnimationComplete] = useState(false)
    const [isAnimated, setIsAnimated] = useState(false)

    const hourlyData = useMemo(() => {
      const selectedDay = data.find(day => day.date === selectedDate)
      if (!selectedDay?.online_time_messages) return []

      const hours = new Array(24).fill(0).map((_, index) => ({
        hour: `${index.toString().padStart(2, '0')}:00`,
        onlineTime: 0,
        messages: [] as { start: Date; end: Date }[],
      }))

      selectedDay.online_time_messages.forEach(message => {
        const start = new Date(message.start_time)
        const end = new Date(message.end_time)
        const startHour = start.getHours()
        const endHour = end.getHours()

        if (startHour === endHour) {
          const duration = (end.getTime() - start.getTime()) / 3600000
          hours[startHour].onlineTime += duration
          hours[startHour].messages.push({ start, end })
        } else {
          for (let hour = startHour; hour <= endHour; hour++) {
            let duration = 0
            if (hour === startHour) {
              duration = (60 - start.getMinutes()) / 60
            } else if (hour === endHour) {
              duration = end.getMinutes() / 60
            } else {
              duration = 1
            }
            hours[hour].onlineTime += duration
            hours[hour].messages.push({ start, end })
          }
        }
      })

      return hours
    }, [data, selectedDate])

    return (
      <ChartCard
        title="Tempo Online por Hora"
        action={
          <DateSelector
            dates={data.map(day => ({
              date: day.date,
              label: `${new Date(day.date).toLocaleDateString('pt-BR')} - ${day.total_online_time_str}`,
            }))}
            selectedDate={selectedDate}
            onDateChange={onDateChange}
          />
        }
      >
        <Box className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData} onMouseMove={() => !isAnimated && setIsAnimated(true)}>
              <defs>
                <linearGradient id="onlineBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.chart.online} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={COLORS.chart.online} stopOpacity={0.2} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chart.grid} />

              <XAxis
                dataKey="hour"
                stroke={COLORS.text.secondary}
                tick={{ fill: COLORS.text.secondary }}
              />

              <YAxis
                stroke={COLORS.text.secondary}
                tick={{ fill: COLORS.text.secondary }}
                tickFormatter={value => `${value}h`}
              />

              <Tooltip
                content={<CustomTooltip valueFormatter={value => `${value.toFixed(2)} horas`} />}
              />

              <Bar
                dataKey="onlineTime"
                name="Tempo Online"
                radius={[4, 4, 0, 0]}
                onMouseEnter={data => setHoveredBar(data.hour)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {hourlyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={hoveredBar === entry.hour ? COLORS.chart.online : 'url(#onlineBar)'}
                    className="transition-colors duration-200"
                  >
                    {animationComplete && (
                      <animate
                        attributeName="opacity"
                        from="0"
                        to="1"
                        dur="0.5s"
                        begin={`${index * 50}ms`}
                      />
                    )}
                  </Cell>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </ChartCard>
    )
  }

  const ChartCard: React.FC<ChartCardProps> = ({ title, children, action, isLoading = false }) => (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-gray-700 bg-gray-900 p-6"
    >
      <HStack className="mb-6 justify-between">
        <Text className="text-lg font-semibold text-white">{title}</Text>
        {action}
      </HStack>
      {isLoading ? <LoadingSpinner /> : children}
    </MotionBox>
  )

  const CustomTooltip: React.FC<CustomTooltipProps> = ({
    active,
    payload,
    label,
    valueFormatter = val => val?.toString() || '0',
  }) => {
    if (!active || !payload) return null

    return (
      <MotionBox
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-lg border border-gray-700 bg-gray-800 p-3 shadow-lg"
      >
        <Text className="mb-2 text-sm font-medium text-white">{label}</Text>
        {payload.map((item, index) => (
          <HStack key={index} className="space-x-2">
            <Box className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            <Text className="text-sm text-gray-300">
              {`${item.name}: ${valueFormatter(item.value)}`}
            </Text>
          </HStack>
        ))}
      </MotionBox>
    )
  }

  const DateSelector = ({
    dates,
    selectedDate,
    onDateChange,
  }: {
    dates: { date: string; label: string }[]
    selectedDate: string
    onDateChange: (date: string) => void
  }) => (
    <Menu>
      <MenuButton
        as={Button}
        className="bg-gray-800 text-white transition-colors hover:bg-gray-700"
        rightIcon={<ChevronDownIcon className="h-4 w-4" />}
      >
        {selectedDate ? new Date(selectedDate).toLocaleDateString('pt-BR') : 'Selecionar Data'}
      </MenuButton>
      <MenuList className="scrollbar-thin scrollbar-thumb-gray-700 max-h-60 overflow-y-auto border-gray-700 bg-gray-800">
        {dates.map(({ date, label }) => (
          <MenuItem
            key={date}
            onClick={() => onDateChange(date)}
            className={`
            text-white transition-colors hover:bg-gray-700
            ${selectedDate === date ? 'bg-gray-700' : ''}
          `}
          >
            {label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  )

  return (
    <Box className="mx-auto w-full max-w-7xl space-y-8 p-6">
      <MotionBox initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Text className="mb-2 text-3xl font-bold text-white">Estatísticas do Jogador</Text>
        <Box className="h-1 w-32 rounded bg-indigo-600" />
      </MotionBox>

      <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <Grid
          templateColumns={{
            base: 'repeat(1, 1fr)',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          }}
          gap={6}
        >
          <StatCard
            title="Nível Atual"
            value={latestExp?.level || 'N/A'}
            change={latestExp?.level_change}
            icon={StarIcon}
          />
          <StatCard
            title="Experiência Total"
            value={formatLargeNumber(latestExp?.experience || 0)}
            change={latestExp?.exp_change}
            icon={TrendingUpIcon}
          />
          <StatCard
            title="Média Exp/Hora"
            value={formatLargeNumber(latestExp?.average_experience_per_hour || 0)}
            suffix="/h"
            change={latestExp?.average_experience_per_hour}
            icon={ZapIcon}
          />
          <StatCard title="Tempo Online" value={latestExp?.time_online || 'N/A'} icon={ClockIcon} />
        </Grid>
      </MotionBox>

      {!hasExperienceData && !hasOnlineHistory ? (
        <EmptyState
          title="Sem dados de progresso"
          message="Não há dados de experiência ou tempo online disponíveis para este jogador."
        />
      ) : (
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
            {hasExperienceData && (
              <GridItem>
                <ExperienceChart data={experienceData} formatValue={formatLargeNumber} />
              </GridItem>
            )}

            {hasOnlineHistory && (
              <GridItem>
                <OnlineTimeChart
                  data={sortedHistory}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                />
              </GridItem>
            )}
          </Grid>
        </MotionBox>
      )}

      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-xl border border-gray-700 bg-gray-900 p-6"
      >
        <Text className="mb-4 text-lg font-semibold text-white">Histórico de Mortes</Text>
        <Box className="overflow-x-auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th className="text-gray-400">Data</Th>
                <Th className="text-gray-400">Killer</Th>
                <Th className="text-gray-400">Detalhes</Th>
              </Tr>
            </Thead>
            <Tbody>
              {deathData?.deaths.slice(0, 5).map((death, index) => (
                <MotionBox
                  key={index}
                  as="tr"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{
                    backgroundColor: 'rgba(55, 65, 81, 0.5)',
                    transition: { duration: 0.2 },
                  }}
                  className="border-b border-gray-800"
                >
                  <Td className="text-white">{new Date(death.date).toLocaleDateString('pt-BR')}</Td>
                  <Td className="text-white">{death.killers[0]}</Td>
                  <Td className="text-white">
                    <ChakraTooltip label={death.text} hasArrow placement="top">
                      <Text className="max-w-xs cursor-help truncate">{death.text}</Text>
                    </ChakraTooltip>
                  </Td>
                </MotionBox>
              ))}
            </Tbody>
          </Table>
        </Box>
      </MotionBox>
    </Box>
  )
}

export default PlayerDashboard
