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
import { Shield, ChevronDown } from 'lucide-react'

import { useStorageStore } from '@/common/stores/storage-store'

type Mode = 'ally' | 'enemy'

interface ModeConfig {
  label: string
  color: string
  hoverColor: string
  bgColor: string
  icon: JSX.Element
}

const getModeConfig = (mode: Mode, isClient: boolean): ModeConfig =>
  ({
    ally: {
      label: 'Aliado',
      color: 'green.400',
      hoverColor: 'green.500',
      bgColor: 'rgba(74, 222, 128, 0.1)',
      icon: <Shield size={16} color={isClient ? '#4ADE80' : '#F87171'} />,
    },
    enemy: {
      label: 'Inimigo',
      color: 'red.400',
      hoverColor: 'red.500',
      bgColor: 'rgba(248, 113, 113, 0.1)',
      icon: <Shield size={16} color="#F87171" />,
    },
  })[mode]

const ModeSelect = () => {
  const toast = useToast()
  const setStorageItem = useStorageStore(state => state.setItem)
  const [isClient, setIsClient] = useState(false)
  const [currentMode, setCurrentMode] = useState<Mode>('enemy')

  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined') {
      const storedMode = useStorageStore.getState().getItem('monitorMode', 'enemy') as Mode
      setCurrentMode(storedMode)
    }
  }, [])

  const handleModeChange = (newMode: Mode) => {
    setStorageItem('monitorMode', newMode)

    const newConfig = getModeConfig(newMode, true)
    toast({
      title: `Modo alterado para ${newConfig.label}`,
      status: newMode === 'ally' ? 'success' : 'error',
      duration: 2000,
      position: 'bottom-right',
      isClosable: true,
    })

    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  const currentConfig = getModeConfig(currentMode, isClient)

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
          {currentConfig.icon}
          <Text fontSize="sm" color={currentConfig.color}>
            {currentConfig.label}
          </Text>
          <ChevronDown
            size={14}
            color={currentConfig.color === 'green.400' ? '#4ADE80' : '#F87171'}
          />
        </HStack>
      </MenuButton>

      <Portal>
        <MenuList
          bg="rgba(26, 26, 26, 0.95)"
          backdropFilter="blur(12px)"
          border="1px solid"
          borderColor="whiteAlpha.200"
          p={1}
        >
          {(['enemy', 'ally'] as Mode[]).map(mode => {
            const config = getModeConfig(mode, isClient)
            return (
              <MenuItem
                key={mode}
                onClick={() => handleModeChange(mode)}
                bg="transparent"
                _hover={{ bg: 'whiteAlpha.200' }}
                color="gray.300"
                fontSize="sm"
              >
                <HStack spacing={2}>
                  {config.icon}
                  <Text>{config.label}</Text>
                </HStack>
              </MenuItem>
            )
          })}
        </MenuList>
      </Portal>
    </Menu>
  )
}

export default ModeSelect
