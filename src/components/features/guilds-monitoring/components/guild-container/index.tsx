'use client'

import { useCallback } from 'react'

import { Center, Spinner, SimpleGrid, Box, Text, VStack, HStack, Badge, Tooltip } from '@chakra-ui/react'

import type { GuildMemberResponse } from '@/common/types/guild-member.response'
import { useAlertSound } from '@/components/features/monitoring/hooks/useAlertSound'
import DashboardLayout from '@/components/layout'

import { useGuilds } from '../../hooks/useGuilds'
import { GuildTable } from '../guild-table'

// Extract scrollbar styles to a constant
const scrollbarStyles = {
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
}

export default function GuildContainer() {
  const { debouncedPlaySound } = useAlertSound()

  const {
    types,
    addType,
    handleLocalChange,
    handleClassificationChange,
    groupedData,
    isLoading,
    isConnected,
    status,
  } = useGuilds({
    playSound: debouncedPlaySound,
  })

  // Wrapper que preserva a natureza assíncrona da função original
  const handleLocalChangeWrapped = useCallback(
    async (member: GuildMemberResponse, newLocal: string): Promise<void> => {
      try {
        // Executa a função e espera a Promise ser resolvida se ela for assíncrona
        // Ou converte para Promise se for síncrona
        await Promise.resolve(handleLocalChange(member, newLocal))
      } catch (error) {
        console.error('Erro ao alterar local:', error)
        throw error // Re-throw para manter comportamento de erro
      }
    },
    [handleLocalChange]
  )

  const renderContent = () => {
    if (isLoading) {
      return (
        <Center h="100vh">
          <Spinner size="xl" />
        </Center>
      )
    }

    if (!groupedData || groupedData.length === 0) {
      return (
        <Center h="100vh">
          <Text>Nenhum dado de guilda disponível.</Text>
        </Center>
      )
    }

    return (
      <VStack w="full" spacing={4} align="stretch">
        <Box
          px={4}
          py={3}
          bg="#0D0D0D"
          borderColor="#141414"
          borderWidth="1px"
          borderRadius="md"
        >
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between" align="center">
              <HStack spacing={4}>
                <Tooltip label="SSE Connection Status">
                  <Badge
                    colorScheme={status === 'connected' ? 'green' : status === 'connecting' ? 'yellow' : 'red'}
                    variant="subtle"
                  >
                    {status.toUpperCase()}
                  </Badge>
                </Tooltip>
                <Text fontSize="sm" color="gray.400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Text>
              </HStack>
              <HStack spacing={4}>
                <Tooltip label="Total Members">
                  <Text fontSize="sm" color="gray.400">
                    Members: {groupedData.reduce((acc, group) => acc + group.data.length, 0)}
                  </Text>
                </Tooltip>
                <Tooltip label="Online Members">
                  <Text fontSize="sm" color="gray.400">
                    Online: {groupedData.reduce((acc, group) => acc + group.onlineCount, 0)}
                  </Text>
                </Tooltip>
              </HStack>
            </HStack>
          </VStack>
        </Box>
        <Box
          w="full"
          px={2}
          py={2}
          overflow="auto"
          css={scrollbarStyles}
        >
        <SimpleGrid
          columns={{ base: 1, lg: 3 }}
          spacing={{ base: 4, lg: 6 }}
          minChildWidth={{ base: '100%', lg: '400px' }}
        >
          {groupedData.map(({ type, data, onlineCount }) => (
            <Box
              key={type}
              w="full"
              maxW="100%"
            >
                <GuildTable
                  key={type}
                  type={type}
                  data={data}
                  onlineCount={onlineCount}
                  onLocalChange={handleLocalChange}
                  onClassificationChange={handleClassificationChange}
                  showExivaInput={type !== 'exitados'}
                  addType={addType}
                  isLoading={isLoading}
                />
            </Box>
          ))}
        </SimpleGrid>
      </Box>
      </VStack>
    )
  }

  return (
    <DashboardLayout>
      {renderContent()}
    </DashboardLayout>
  )
}
