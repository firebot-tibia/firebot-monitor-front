'use client'

import { useEffect, useState } from 'react'

import { Box, Text, HStack, Badge, Tooltip } from '@chakra-ui/react'

import { useGuildSSE } from '../../hooks/useGuildSSE'

export const SSEStatus = () => {
  // Create no-op handlers since we only want to monitor status
  const { status, isConnected } = useGuildSSE({
    onGuildData: () => {},
    onGuildChanges: () => {},
  })

  // Track connection uptime
  const [uptime, setUptime] = useState(0)
  useEffect(() => {
    if (!isConnected) {
      setUptime(0)
      return
    }

    const interval = setInterval(() => {
      setUptime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isConnected])

  // Format uptime for display
  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'green'
      case 'connecting':
        return 'yellow'
      case 'disconnected':
        return 'red'
      default:
        return 'gray'
    }
  }

  return (
    <Box bg="#0D0D0D" borderColor="#141414" borderWidth="1px" borderRadius="md" p={2}>
      <HStack spacing={4}>
        <Tooltip label="SSE Connection Status">
          <Badge colorScheme={getStatusColor()} variant="subtle">
            {status.toUpperCase()}
          </Badge>
        </Tooltip>
        {isConnected && (
          <Tooltip label="Connection Uptime">
            <Text fontSize="sm" color="gray.400">
              Uptime: {formatUptime(uptime)}
            </Text>
          </Tooltip>
        )}
      </HStack>
    </Box>
  )
}

export default SSEStatus
