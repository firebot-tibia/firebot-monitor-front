'use client'

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

import { useTokenStore } from '@/stores/token-decoded-store'
import { capitalizeFirstLetter } from '@/utils/capitalize-first-letter'

const WorldSelect = () => {
  const toast = useToast()
  const { decodedToken, selectedWorld, setSelectedWorld } = useTokenStore()

  // Get all available worlds from the decoded token
  const availableWorlds = decodedToken?.guilds ? Object.keys(decodedToken.guilds) : []

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
            {selectedWorld ? capitalizeFirstLetter(selectedWorld) : 'Selecionar Mundo'}
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
          {availableWorlds.map((world: string) => (
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
          ))}
        </MenuList>
      </Portal>
    </Menu>
  )
}

export default WorldSelect
