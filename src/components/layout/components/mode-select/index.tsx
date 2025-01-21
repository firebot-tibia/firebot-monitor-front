'use client'
import React, { useState, useEffect } from 'react'

import { Menu, MenuButton, MenuList, MenuItem, Button, Box } from '@chakra-ui/react'
import { ChevronDownIcon } from 'lucide-react'

import { useStorageStore } from '../../../../stores/storage-store'

type Mode = 'ally' | 'enemy'

interface ModeSelectProps {
  onChange?: (mode: Mode) => void
}

const modeMap: Record<Mode, string> = {
  ally: 'Aliado',
  enemy: 'Inimigo',
}

const ModeSelect: React.FC<ModeSelectProps> = ({ onChange }) => {
  const [mounted, setMounted] = useState(false)
  const [monitorMode, setMonitorMode] = useState<Mode>('enemy')

  useEffect(() => {
    const storedMode = useStorageStore.getState().getItem('monitorMode', 'enemy') as Mode
    setMonitorMode(storedMode)
    setMounted(true)
  }, [])

  const handleModeChange = (newMode: Mode) => {
    useStorageStore.getState().setItem('monitorMode', newMode)
    setMonitorMode(newMode)
    if (onChange) {
      onChange(newMode)
    }
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  if (!mounted) {
    return null
  }

  const availableModes = Object.keys(modeMap).filter(mode => mode !== monitorMode) as Mode[]

  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        bg="black"
        color="white"
        borderColor="gray.600"
        _hover={{ bg: 'gray.700', borderColor: 'gray.400' }}
        _expanded={{ bg: 'gray.700' }}
      >
        {modeMap[monitorMode]}
      </MenuButton>
      <MenuList bg="black" borderColor="gray.600">
        {availableModes.map(mode => (
          <MenuItem
            key={mode}
            onClick={() => handleModeChange(mode)}
            bg="black"
            _hover={{ bg: 'gray.700' }}
          >
            <Box display="flex" alignItems="center">
              {modeMap[mode]}
            </Box>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  )
}

export default ModeSelect
