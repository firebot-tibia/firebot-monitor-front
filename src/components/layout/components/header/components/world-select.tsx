'use client'

import { useState, useEffect } from 'react'

import {
  Box,
  Text,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
  useToast,
} from '@chakra-ui/react'
import { Globe, ChevronDown, Check } from 'lucide-react'

import { capitalizeFirstLetter } from '@/common/utils/capitalize-first-letter'
import { useTokenStore } from '@/components/features/auth/store/token-decoded-store'

const WorldSelect = () => {
  const toast = useToast()
  const { decodedToken, selectedWorld, setSelectedWorld } = useTokenStore()

  // Use a client-only approach to prevent hydration mismatches
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // This only runs on the client
    setIsClient(true)
  }, [])

  // Get all available worlds from the decoded token
  const availableWorlds = isClient && decodedToken?.guilds
    ? Object.keys(decodedToken.guilds)
    : []

  // Theme constants
  const baseColor = 'purple.400'
  const menuBgColor = 'rgba(26, 26, 26, 0.95)'

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

  // Only show selected world on the client to avoid hydration mismatch
  const displayWorldName = !isClient
    ? 'Selecionar Mundo'  // Server-rendered value - must match what's in the HTML
    : (selectedWorld ? capitalizeFirstLetter(selectedWorld) : 'Selecionar Mundo')

  // Create menu items array outside of JSX to simplify rendering
  const worldMenuItems = availableWorlds.map((world: string) => (
    <MenuItem
      key={world}
      onClick={() => handleWorldChange(world)}
      bg="transparent"
      _hover={{ bg: 'whiteAlpha.200' }}
      color="gray.300"
      fontSize="sm"
    >
      <HStack justify="space-between" w="full">
        <Text>{capitalizeFirstLetter(world)}</Text>
        {selectedWorld === world && <Check size={14} color="#9333EA" />}
      </HStack>
    </MenuItem>
  ))

  return (
    <Menu>
      <MenuButton
        as={Box}
        cursor="pointer"
        px={2}
        py={1}
        borderRadius="md"
        _hover={{ bg: 'whiteAlpha.200' }}
      >
        <HStack spacing={2}>
          <Globe size={16} color="#9333EA" />
          <Text fontSize="sm" color={baseColor}>
            {displayWorldName}
          </Text>
          <ChevronDown size={14} color="#9333EA" />
        </HStack>
      </MenuButton>

      <Portal>
        <MenuList
          bg={menuBgColor}
          backdropFilter="blur(12px)"
          border="1px solid"
          borderColor="whiteAlpha.200"
          p={1}
          minW="200px"
          maxH="400px"
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(147, 51, 234, 0.3)',
              borderRadius: '4px',
            },
          }}
        >
          {worldMenuItems}
        </MenuList>
      </Portal>
    </Menu>
  )
}

export default WorldSelect
