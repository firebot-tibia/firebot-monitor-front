'use client'
import { useState, useEffect, useCallback } from 'react'

import { Center, Spinner, SimpleGrid, Text, Box } from '@chakra-ui/react'

import { useAlertSound } from '@/components/features/monitoring/hooks/useAlertSound'
import { useMonitoringSettingsStore } from '@/components/features/monitoring/stores/monitoring-settings-store'
import DashboardLayout from '@/components/layout'

import { useCharacterTracker } from '../../hooks/useCharacterTracker'
import { useGuilds } from '../../hooks/useGuilds'
import GuildTable from '../guild-table'

export default function GuildContainer() {
  const [isClient, setIsClient] = useState(false)
  const { debouncedPlaySound } = useAlertSound()
  const [key, setKey] = useState(0)
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now())
  const [updateCount, setUpdateCount] = useState(0)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsClient(true)
      document.documentElement.setAttribute('data-user-interacted', 'true')
    }
  }, [])

  const {
    types,
    addType,
    handleLocalChange,
    handleClassificationChange,
    groupedData,
    isLoading: guildsLoading,
    isConnected,
  } = useGuilds({
    playSound: debouncedPlaySound, // Use debounced version for alerts
  })

  // Track updates for monitoring purposes
  useEffect(() => {
    const now = Date.now()
    if (isConnected) {
      setLastUpdateTime(now)
      setUpdateCount(count => count + 1)
      console.log('Connection status update:', {
        timeSinceLastUpdate: Math.round((now - lastUpdateTime) / 1000) + 's',
        updateCount: updateCount + 1
      })
    }
  }, [isConnected, lastUpdateTime, updateCount])

  // Monitor connection health
  useEffect(() => {
    const CHECK_INTERVAL = 30000 // 30 seconds
    const MAX_TIME_WITHOUT_UPDATE = 60000 // 1 minute

    const interval = setInterval(() => {
      const now = Date.now()
      const timeSinceLastUpdate = now - lastUpdateTime

      if (timeSinceLastUpdate > MAX_TIME_WITHOUT_UPDATE && isConnected) {
        console.warn('No updates received for too long:', {
          timeSinceLastUpdate: Math.round(timeSinceLastUpdate / 1000) + 's'
        })
      }
    }, CHECK_INTERVAL)

    return () => clearInterval(interval)
  }, [isConnected, lastUpdateTime])

  if (!isClient) {
    return (
      <DashboardLayout>
        <Center h="100vh">
          <Spinner size="xl" />
          <Text ml={4}>Initializing client...</Text>
        </Center>
      </DashboardLayout>
    )
  }

  // Mostrar estado de loading/erro de forma mais informativa
  if (!types?.length || !groupedData?.length) {
    return (
      <DashboardLayout>
        <Center h="100vh" flexDirection="column">
          <Spinner size="sm" mb={4} />
          <Text fontSize="sm" color="gray.500" mb={2}>
            {guildsLoading
              ? 'Carregando dados...'
              : isConnected
                ? 'Aguardando dados do servidor...'
                : 'Desconectado do servidor'}
          </Text>
          <Text fontSize="xs" color="gray.400">
            Status: {isConnected ? 'connected' : 'disconnected'} | Tipos: {types?.length || 0} | Grupos: {groupedData?.length || 0}
          </Text>
          {!isConnected && (
            <Text fontSize="xs" color="red.400" mt={2}>
              Tentando reconectar automaticamente...
            </Text>
          )}
        </Center>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Box
        w="full"
        px={2}
        py={2}
        overflow="auto"
        css={{
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '24px',
          },
        }}
      >


        <SimpleGrid
          columns={{ base: 1, lg: 3 }}
          spacing={{ base: 4, lg: 6 }}
          minChildWidth={{ base: '100%', lg: '400px' }}
        >
          {groupedData.map(({ type, data, onlineCount }) => (
            <Box key={type} w="full" minW={{ base: 'calc(100vw - 32px)', lg: '400px' }} maxW="100%">
              <GuildTable
                key={`${type}-${key}`} // Add key to force re-render
                type={type}
                data={data}
                onlineCount={onlineCount}
                onLocalChange={handleLocalChange}
                onClassificationChange={handleClassificationChange}
                showExivaInput={type !== 'exitados'}
                types={types}
                addType={addType}
                isLoading={guildsLoading}
              />
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </DashboardLayout>
  )
}
