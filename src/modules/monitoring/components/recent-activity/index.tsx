import { useMemo, useState } from 'react'

import { Box, VStack, Text, Badge, HStack, IconButton } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'

import { ActivityTabs } from './activity-tabs'
import { useGuildContext } from '../../contexts/guild-context'
import type { DeathEvent } from '../../types/death'
import type { LevelEvent } from '../../types/level'

// Correct way to create a motion component from Chakra UI component
const MotionBox = motion(Box)

export function ActivityWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const { recentDeaths, recentLevels, selectedMode, selectedWorld } = useGuildContext()

  // Process and filter activities within last 24 hours
  const { allyActivities, enemyActivities } = useMemo(() => {
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const processActivities = (deaths: DeathEvent[], levels: LevelEvent[], isAlly: boolean) => {
      const deathEvents = deaths
        .filter(d => {
          const isInTimeRange = new Date(d.death.date) > twentyFourHoursAgo
          const matchesWorld = d.death.world === selectedWorld
          const matchesMode = isAlly ? d.death.isAlly : !d.death.isAlly
          return isInTimeRange && matchesWorld && matchesMode
        })
        .map(d => ({
          type: 'death' as const,
          date: new Date(d.death.date),
          data: d.death,
        }))

      const levelChanges = levels
        .filter(l => {
          const matchesWorld = l.level.world === selectedWorld
          const matchesMode = isAlly ? l.level.isAlly : !l.level.isAlly
          return matchesWorld && matchesMode
        })
        .map(l => ({
          type: 'level' as const,
          date: new Date(l.level.timestamp || ''),
          data: {
            ...l.level,
            direction: l.level.new_level > l.level.old_level ? ('up' as const) : ('down' as const),
          },
        }))

      return {
        deaths: deathEvents,
        levelUps: levelChanges.filter(l => l.data.direction === 'up'),
        levelDowns: levelChanges.filter(l => l.data.direction === 'down'),
      }
    }

    return {
      allyActivities: processActivities(recentDeaths, recentLevels, true),
      enemyActivities: processActivities(recentDeaths, recentLevels, false),
    }
  }, [recentDeaths, recentLevels, selectedWorld, selectedMode])

  const hasAllyActivities =
    allyActivities.deaths.length ||
    allyActivities.levelUps.length ||
    allyActivities.levelDowns.length
  const hasEnemyActivities =
    enemyActivities.deaths.length ||
    enemyActivities.levelUps.length ||
    enemyActivities.levelDowns.length

  if (!hasAllyActivities && !hasEnemyActivities) return null

  return (
    <>
      {/* Toggle Button */}
      <IconButton
        aria-label="Toggle Activity Widget"
        icon={<Activity size={20} />}
        position="fixed"
        right={isOpen ? '300px' : '0'}
        top="50%"
        transform="translateY(-50%)"
        zIndex={11}
        variant="solid"
        colorScheme="blue"
        borderRadius={isOpen ? '4px 0 0 4px' : '4px'}
        size="sm"
        onClick={() => setIsOpen(prev => !prev)}
        transition="right 0.3s"
      />

      {/* Activity Widget Panel */}
      <MotionBox
        position="fixed"
        right={0}
        top={0}
        bottom={0}
        width="300px"
        bg="blackAlpha.800"
        borderLeft="1px solid"
        borderColor="whiteAlpha.200"
        overflowY="auto"
        pt="70px" // Space for header
        pb={4}
        zIndex={10}
        initial={{ x: 310 }}
        animate={{ x: isOpen ? 0 : 310 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
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
        <VStack align="stretch" spacing={3} p={4}>
          <VStack spacing={4} align="stretch">
            {hasAllyActivities && (
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="green.300" textAlign="center" mb={2}>
                  Aliados (24h)
                </Text>
                <ActivityTabs activities={allyActivities} />
              </Box>
            )}
            {hasEnemyActivities && (
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="red.300" textAlign="center" mb={2}>
                  Inimigos (24h)
                </Text>
                <ActivityTabs activities={enemyActivities} />
              </Box>
            )}
          </VStack>
        </VStack>
      </MotionBox>
    </>
  )
}
