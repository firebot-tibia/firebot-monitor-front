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
} from '@chakra-ui/react'
import { Globe, ChevronDown, Check } from 'lucide-react'

import { capitalizeFirstLetter } from '@/core/utils/capitalize-first-letter'

import { useWorldSelect } from './use-world-select'
import { WorldStatusTag } from './world-status-tag'

const WorldSelect = () => {
  const baseColor = 'purple.400'
  const menuBgColor = 'rgba(26, 26, 26, 0.95)'
  const [isClient, setIsClient] = useState(false)

  const {
    selectedWorld,
    displayWorldName,
    sortedWorlds,
    getWorldStatus,
    handleWorldChange,
  } = useWorldSelect()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't render anything until we're on the client
  if (!isClient) {
    return null
  }

  const worldMenuItems = sortedWorlds.map((world: string) => {
    const status = getWorldStatus(world)
    return (
      <MenuItem
        key={world}
        onClick={() => handleWorldChange(world)}
        bg="transparent"
        _hover={{ bg: 'whiteAlpha.200' }}
        color="gray.300"
        fontSize="sm"
      >
        <HStack justify="space-between" w="full">
          <HStack>
            <Text>{capitalizeFirstLetter(world)}</Text>
            {status && <WorldStatusTag status={status} />}
          </HStack>
          {selectedWorld === world && <Check size={14} color="#9333EA" />}
        </HStack>
      </MenuItem>
    )
  })

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
          <HStack>
            <Text fontSize="sm" color={baseColor}>
              {displayWorldName}
            </Text>
            {selectedWorld && getWorldStatus(selectedWorld) && (
              <WorldStatusTag status={getWorldStatus(selectedWorld)!} />
            )}
          </HStack>
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
