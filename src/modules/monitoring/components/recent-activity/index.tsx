import { useMemo, useState } from 'react'

import { Box, VStack, Text, useColorModeValue, IconButton } from '@chakra-ui/react'
import { Activity } from 'lucide-react'

import { ActivityTabs } from './tabs/activity-tabs'
import { useGuildContext } from '../../contexts/guild-context'
import type { DeathEvent } from '../../types/death'
import type { LevelEvent } from '../../types/level'

export function ActivityWidget() {
  const [isOpen, setIsOpen] = useState(true)
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
        .sort((a, b) => b.date.getTime() - a.date.getTime())

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
        .sort((a, b) => b.date.getTime() - a.date.getTime())

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
    <>
      <IconButton
        aria-label="Toggle Activity Widget"
        icon={<Activity size={20} />}
        position="fixed"
        right={isOpen ? '300px' : '0'}
        top="50%"
        transform="translateY(-50%)"
        zIndex={11}
        variant="solid"
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.800', 'white')}
        boxShadow="md"
        _hover={{
          bg: useColorModeValue('gray.100', 'gray.700'),
        }}
        borderRadius={isOpen ? '4px 0 0 4px' : '4px'}
        size="sm"
        onClick={() => setIsOpen(prev => !prev)}
        transition="right 0.3s"
      />

      <Box
        transform={`translateX(${isOpen ? '0' : '100%'})`}
        transition="transform 0.3s ease-in-out"
        position="fixed"
        right={0}
        top={0}
        bottom={0}
        width="300px"
        bg={useColorModeValue('whiteAlpha.900', 'blackAlpha.800')}
        borderLeft="1px solid"
        borderColor={useColorModeValue('gray.200', 'whiteAlpha.200')}
        overflowY="auto"
        pt={4}
        pb={4}
        zIndex={10}
        boxShadow="-4px 0 6px rgba(0, 0, 0, 0.1)"
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
              <Text
                fontSize="sm"
                fontWeight="bold"
                color={useColorModeValue('green.600', 'green.300')}
                textAlign="center"
                mb={2}
              >
                Aliados (24h)
              </Text>
              {hasAllyActivities ? (
                <ActivityTabs activities={allyActivities} />
              ) : (
                <Text fontSize="sm" color={'whiteAlpha.600'} textAlign="center">
                  Nenhuma atividade recente
                </Text>
              )}
            </Box>
            <Box>
              <Text
                fontSize="sm"
                fontWeight="bold"
                color={useColorModeValue('red.600', 'red.300')}
                textAlign="center"
                mb={2}
              >
                Inimigos (24h)
              </Text>
              {hasEnemyActivities ? (
                <ActivityTabs activities={enemyActivities} />
              ) : (
                <Text fontSize="sm" color={'whiteAlpha.600'} textAlign="center">
                  Nenhuma atividade recente
                </Text>
              )}
            </Box>
          </VStack>
        </VStack>
      </Box>
    </>
  )
}
