'use client'
import { useState, useEffect } from 'react'

import { Center, Spinner, SimpleGrid, Text, Box } from '@chakra-ui/react'

import { useAlertSound } from '@/components/features/monitoring/hooks/useAlertSound'
import DashboardLayout from '@/components/layout'

import { useGuilds } from '../../hooks/useGuilds'
import GuildTable from '../guild-table'

export default function GuildContainer() {
  const [isClient, setIsClient] = useState(false)
  const { debouncedPlaySound } = useAlertSound()
  const [key, setKey] = useState(0)
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
    sseStatus,
  } = useGuilds({
    playSound: debouncedPlaySound, // Use debounced version for alerts
  })

  useEffect(() => {
    if (sseStatus === 'connected') {
      setKey(k => k + 1)
    }
  }, [sseStatus])

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

  if (!types?.length || !groupedData?.length) {
    return (
      <DashboardLayout>
        <Center h="100vh" flexDirection="column">
          <Spinner size="sm" mb={4} />
          <Text fontSize="sm" color="gray.500">
            {guildsLoading
              ? 'Carregando dados...'
              : sseStatus === 'connecting'
                ? 'Conectando ao servidor...'
                : sseStatus === 'disconnected'
                  ? 'Desconectado do servidor'
                  : 'Aguardando dados do servidor...'}
          </Text>
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
