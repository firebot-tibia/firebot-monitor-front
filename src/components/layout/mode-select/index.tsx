import React, { useState, useEffect } from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Box,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useStorageStore } from "../../../store/storage-store";

type Mode = 'ally' | 'enemy';

interface ModeSelectProps {
  onChange?: (mode: Mode) => void;
}

const modeMap: Record<Mode, string> = {
  'ally': 'Aliado',
  'enemy': 'Inimigo'
};

const ModeSelect: React.FC<ModeSelectProps> = ({ onChange }) => {
  const [mounted, setMounted] = useState(false);
  const [monitorMode, setMonitorMode] = useState<Mode>('enemy');

  useEffect(() => {
    const storedMode = useStorageStore.getState().getItem('monitorMode', 'enemy') as Mode;
    setMonitorMode(storedMode);
    setMounted(true);
  }, []);

  const handleModeChange = (newMode: Mode) => {
    useStorageStore.getState().setItem('monitorMode', newMode);
    setMonitorMode(newMode);
    if (onChange) {
      onChange(newMode);
    }
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        bg="black"
        color="white"
        borderColor="gray.600"
        _hover={{ bg: "gray.700", borderColor: "gray.400" }}
        _expanded={{ bg: "gray.700" }}
      >
        {modeMap[monitorMode]}
      </MenuButton>
      <MenuList bg="black" borderColor="gray.600">
        <MenuItem
          onClick={() => handleModeChange('ally')}
          bg="black"
          _hover={{ bg: "gray.700" }}
        >
          <Box display="flex" alignItems="center">
            {modeMap.ally}
          </Box>
        </MenuItem>
        <MenuItem
          onClick={() => handleModeChange('enemy')}
          bg="black"
          _hover={{ bg: "gray.700" }}
        >
          <Box display="flex" alignItems="center">
            {modeMap.enemy}
          </Box>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default ModeSelect;