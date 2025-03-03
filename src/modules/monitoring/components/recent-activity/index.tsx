import { useMemo } from 'react'

import { Box, VStack, Text } from '@chakra-ui/react'

import { ActivityTabs } from './activity-tabs'
import { useGuildContext } from '../../contexts/guild-context'
import type { DeathEvent } from '../../types/death'
import type { LevelEvent } from '../../types/level'

export function ActivityWidget() {
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

  return (
      <Box
        position="fixed"
        right={0}
        top={0}
        bottom={0}
        width="300px"
        bg="blackAlpha.800"
        borderLeft="1px solid"
        borderColor="whiteAlpha.200"
        overflowY="auto"
        pt={4}
        pb={4}
        zIndex={10}

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
            <Box>
              <Text fontSize="sm" fontWeight="bold" color="green.300" textAlign="center" mb={2}>
                Aliados (24h)
              </Text>
              {hasAllyActivities ? (
                <ActivityTabs activities={allyActivities} />
              ) : (
                <Text fontSize="sm" color="whiteAlpha.600" textAlign="center">
                  Nenhuma atividade recente
                </Text>
              )}
            </Box>
            <Box>
              <Text fontSize="sm" fontWeight="bold" color="red.300" textAlign="center" mb={2}>
                Inimigos (24h)
              </Text>
              {hasEnemyActivities ? (
                <ActivityTabs activities={enemyActivities} />
              ) : (
                <Text fontSize="sm" color="whiteAlpha.600" textAlign="center">
                  Nenhuma atividade recente
                </Text>
              )}
            </Box>
          </VStack>
        </VStack>
      </Box>
  )
}
