import { useState, useEffect, useMemo } from 'react'

import { useToast } from '@chakra-ui/react'

import { capitalizeFirstLetter } from '@/core/utils/capitalize-first-letter'
import { useTokenStore } from '@/modules/auth/store/token-decoded-store'

import { useWorldStatusStore } from './store'
import { WORLD_STATUS_PRIORITY } from './types'

export const useWorldSelect = () => {
  const toast = useToast()
  const { selectedWorld, availableWorlds, setSelectedWorld } = useTokenStore()
  const { getWorldStatus } = useWorldStatusStore()

  // Use a client-only approach to prevent hydration mismatches
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // This only runs on the client
    setIsClient(true)
  }, [])

  // Only show selected world on the client to avoid hydration mismatch
  const displayWorldName = !isClient
    ? 'Selecionar Mundo' // Server-rendered value - must match what's in the HTML
    : selectedWorld
      ? capitalizeFirstLetter(selectedWorld)
      : 'Selecionar Mundo'

  // Sort worlds by status priority and alphabetically
  const sortedWorlds = useMemo(() => {
    return [...availableWorlds].sort((a, b) => {
      const statusA = getWorldStatus(a) || 'DOMINATED'
      const statusB = getWorldStatus(b) || 'DOMINATED'

      // First sort by status priority
      const priorityDiff = WORLD_STATUS_PRIORITY[statusA] - WORLD_STATUS_PRIORITY[statusB]
      if (priorityDiff !== 0) return priorityDiff

      // Then sort alphabetically
      return a.localeCompare(b)
    })
  }, [availableWorlds, getWorldStatus])

  const handleWorldChange = (world: string) => {
    setSelectedWorld(world)
    toast({
      title: `Mundo alterado para ${capitalizeFirstLetter(world)}`,
      status: 'success',
      duration: 2000,
      position: 'bottom-right',
      isClosable: true,
    })

    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return {
    selectedWorld,
    displayWorldName,
    sortedWorlds,
    getWorldStatus,
    handleWorldChange,
  }
}
