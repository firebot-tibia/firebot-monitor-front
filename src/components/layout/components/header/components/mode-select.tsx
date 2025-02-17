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

import { useStorageStore } from '@/stores/storage-store'

type Mode = 'ally' | 'enemy'

interface ModeConfig {
  label: string
  color: string
  hoverColor: string
  bgColor: string
  icon: JSX.Element
}

const modeConfigs: Record<Mode, ModeConfig> = {
  ally: {
    label: 'Aliado',
    color: 'green.400',
    hoverColor: 'green.500',
    bgColor: 'rgba(74, 222, 128, 0.1)',
    icon: <Shield size={16} color="#4ADE80" />,
  },
  enemy: {
    label: 'Inimigo',
    color: 'red.400',
    hoverColor: 'red.500',
    bgColor: 'rgba(248, 113, 113, 0.1)',
    icon: <Shield size={16} color="#F87171" />,
  },
}

const ModeSelect = () => {
  const [, setMounted] = useState(false)
  const [monitorMode, setMonitorMode] = useState<Mode>('enemy')
  const toast = useToast()

  useEffect(() => {
    const storedMode = useStorageStore.getState().getItem('monitorMode', 'enemy') as Mode
    setMonitorMode(storedMode)
    setMounted(true)
  }, [])

  const handleModeChange = (newMode: Mode) => {
    useStorageStore.getState().setItem('monitorMode', newMode)
    setMonitorMode(newMode)

    toast({
      title: `Modo alterado para ${modeConfigs[newMode].label}`,
      status: newMode === 'ally' ? 'success' : 'error',
      duration: 2000,
      position: 'bottom-right',
      isClosable: true,
    })

    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  const currentConfig = modeConfigs[monitorMode]

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
          {Object.entries(modeConfigs).map(([mode, config]) => (
            <MenuItem
              key={mode}
              onClick={() => handleModeChange(mode as Mode)}
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
          ))}
        </MenuList>
      </Portal>
    </Menu>
  )
}

export default ModeSelect
