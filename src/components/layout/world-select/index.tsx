import React, { useEffect } from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Box,
  Image,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useTokenStore } from '../../../store/token-decoded-store';
import { capitalizeFirstLetter } from '../../../shared/utils/utils';
import { useSession } from 'next-auth/react';

const WorldSelect: React.FC = () => {
  const { decodedToken, selectedWorld, setSelectedWorld, decodeAndSetToken } = useTokenStore();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.access_token) {
      decodeAndSetToken(session.access_token);
    }
  }, [status, session, decodeAndSetToken]);

  const handleWorldChange = (newWorld: string) => {
    setSelectedWorld(newWorld);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  if (!decodedToken || !decodedToken.guilds) return null;

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
        {Object.keys(decodedToken.guilds).map((worldId) => (
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