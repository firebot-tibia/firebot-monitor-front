import React from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Box,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useTokenStore } from '../../../store/token-decoded-store';
import { capitalizeFirstLetter } from '../../../shared/utils/utils';

interface WorldSelectProps {
  onChange?: (world: string) => void;
}

const WorldSelect: React.FC<WorldSelectProps> = ({ onChange }) => {
  const { decodedToken, selectedWorld, setSelectedWorld } = useTokenStore();

  const handleWorldChange = (newWorld: string) => {
    setSelectedWorld(newWorld);
    if (onChange) {
      onChange(newWorld);
    }
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  if (!decodedToken || !decodedToken.guilds) return null;

  const availableWorlds = Object.keys(decodedToken.guilds).filter(world => world !== selectedWorld);

  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        bg="black"
        color="white"
        borderColor="gray.300"
        _hover={{ bg: "gray.700", borderColor: "gray.400" }}
        _expanded={{ bg: "gray.700" }}
      >
        {selectedWorld ? capitalizeFirstLetter(selectedWorld) : "Select World"}
      </MenuButton>
      <MenuList bg="black" borderColor="gray.600">
        {availableWorlds.map((worldId) => (
          <MenuItem
            key={worldId}
            onClick={() => handleWorldChange(worldId)}
            bg="black"
            _hover={{ bg: "gray.700" }}
          >
            <Box display="flex" alignItems="center">
              {capitalizeFirstLetter(worldId)}
            </Box>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default WorldSelect;