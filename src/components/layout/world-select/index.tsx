import React from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Box,
  Text,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useTokenStore } from '../../../store/token-decoded-store';
import { capitalizeFirstLetter, clearLocalStorage } from '../../../shared/utils/utils';

interface WorldSelectProps {
  onChange?: (world: string) => void;
}

const WorldSelect: React.FC<WorldSelectProps> = ({ onChange }) => {
  const { decodedToken, selectedWorld, setSelectedWorld } = useTokenStore();

  const handleWorldChange = (newWorld: string) => {
    setSelectedWorld(newWorld);
    if (onChange) {
      onChange(newWorld);
      clearLocalStorage();
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
        {availableWorlds.length > 0 ? (
          availableWorlds.map((worldId) => (
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
          ))
        ) : (
          <MenuItem bg="black" _hover={{ bg: "black" }} cursor="default">
            <Text color="gray.400">Nenhum mundo</Text>
          </MenuItem>
        )}
      </MenuList>
    </Menu>
  );
};

export default WorldSelect;