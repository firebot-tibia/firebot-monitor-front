import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  VStack,
  HStack,
  Text,
  Box,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Skull, ArrowUp, ArrowDown } from 'lucide-react'

const MotionBox = motion(Box)

interface ActivityTabsProps {
  activities: {
    deaths: Array<{
      type: 'death'
      date: Date
      data: {
        name: string
        killer: string | null
        date: string
        text: string
        level: number
        vocation: string
        city: string
      }
    }>
    levelUps: Array<{
      type: 'level'
      date: Date
      data: {
        player: string
        old_level: number
        new_level: number
        direction: 'up' | 'down'
      }
    }>
    levelDowns: Array<{
      type: 'level'
      date: Date
      data: {
        player: string
        old_level: number
        new_level: number
        direction: 'up' | 'down'
      }
    }>
  }
}

const ActivityList = ({ children }: { children: React.ReactNode }) => (
  <VStack
    align="stretch"
    spacing={2}
    maxH="calc(100vh - 200px)"
    overflowY="auto"
    css={{
      '&::-webkit-scrollbar': {
        width: '4px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '4px',
      },
    }}
  >
    {children}
  </VStack>
)

const EmptyState = () => (
  <Box textAlign="center" py={4}>
    <Text color="gray.500" fontSize="sm">
      Nenhuma atividade registrada
    </Text>
  </Box>
)

export function ActivityTabs({ activities }: ActivityTabsProps) {
  const { deaths, levelUps, levelDowns } = activities
  
  // Sort activities by date
  const sortedDeaths = [...deaths].sort((a, b) => b.date.getTime() - a.date.getTime())
  const sortedLevelUps = [...levelUps].sort((a, b) => b.date.getTime() - a.date.getTime())
  const sortedLevelDowns = [...levelDowns].sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <Tabs variant="soft-rounded" colorScheme="blue" size="sm" isFitted>
      <TabList>
        <Tab fontSize="xs">Mortes ({deaths.length})</Tab>
        <Tab fontSize="xs">Level Up ({levelUps.length})</Tab>
        <Tab fontSize="xs">Level Down ({levelDowns.length})</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <ActivityList>
            {sortedDeaths.length > 0 ? (
              sortedDeaths.map((activity, index) => (
                <MotionBox
                  key={`death-${activity.data.name}-${activity.date.getTime()}-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <HStack spacing={2} fontSize="sm">
                    <Skull size={14} color="#F56565" />
                    <Text color="gray.300" noOfLines={2}>
                      {activity.data.text}
                      <Text as="span" color="gray.500" fontSize="xs" ml={1}>
                        {activity.date.toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </Text>
                  </HStack>
                </MotionBox>
              ))
            ) : (
              <EmptyState />
            )}
          </ActivityList>
        </TabPanel>
        <TabPanel>
          <ActivityList>
            {sortedLevelUps.length > 0 ? (
              sortedLevelUps.map((activity, index) => (
                <MotionBox
                  key={`levelup-${activity.data.player}-${activity.date.getTime()}-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <HStack spacing={2} fontSize="sm">
                    <ArrowUp size={14} color="#48BB78" />
                    <Text color="gray.300" noOfLines={2}>
                      {activity.data.player} avançou para o level {activity.data.new_level}
                      <Text as="span" color="gray.500" fontSize="xs" ml={1}>
                        {activity.date.toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </Text>
                  </HStack>
                </MotionBox>
              ))
            ) : (
              <EmptyState />
            )}
          </ActivityList>
        </TabPanel>
        <TabPanel>
          <ActivityList>
            {sortedLevelDowns.length > 0 ? (
              sortedLevelDowns.map((activity, index) => (
                <MotionBox
                  key={`leveldown-${activity.data.player}-${activity.date.getTime()}-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <HStack spacing={2} fontSize="sm">
                    <ArrowDown size={14} color="#F56565" />
                    <Text color="gray.300" noOfLines={2}>
                      {activity.data.player} caiu para o level {activity.data.new_level}
                      <Text as="span" color="gray.500" fontSize="xs" ml={1}>
                        {activity.date.toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </Text>
                  </HStack>
                </MotionBox>
              ))
            ) : (
              <EmptyState />
            )}
          </ActivityList>
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}
