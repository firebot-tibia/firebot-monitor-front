import { Flex, IconButton, Spacer, HStack, Text, Switch, Select } from "@chakra-ui/react";
import { FC, useCallback, useState, useEffect } from "react";
import { FaSignOutAlt, FaBars } from "react-icons/fa";
import { signOut } from "next-auth/react";
import { clearLocalStorage } from "../../../shared/utils/utils";

interface TopbarProps {
  onToggleMenu: () => void;
  mode?: 'ally' | 'enemy';
  setMode?: (mode: 'ally' | 'enemy') => void;
  onWorldChange?: (world: string) => void;
}

const Topbar: FC<TopbarProps> = ({ onToggleMenu, mode, setMode, onWorldChange }) => {
  const [worlds, setWorlds] = useState<string[]>([]);
  const [selectedWorld, setSelectedWorld] = useState<string>('');

  useEffect(() => {
    const fetchWorlds = async () => {
      const fetchedWorlds = ['Mundo 1', 'Mundo 2', 'Mundo 3'];
      setWorlds(fetchedWorlds);
      setSelectedWorld(fetchedWorlds[0]);
    };
    fetchWorlds();
  }, []);

  const handleLogout = useCallback(() => {
    clearLocalStorage();
    signOut({ redirect: true, callbackUrl: '/' });
  }, []);

  const handleModeChange = useCallback(() => {
    if (setMode && mode) {
      clearLocalStorage();
      const newMode = mode === 'ally' ? 'enemy' : 'ally';
      setMode(newMode);
      
      const url = new URL(window.location.href);
      url.searchParams.set('mode', newMode);
      window.location.href = url.toString();
    }
  }, [mode, setMode]);

  const handleWorldChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newWorld = event.target.value;
    setSelectedWorld(newWorld);
    if (onWorldChange) {
      onWorldChange(newWorld);
    }
  }, [onWorldChange]);

  return (
    <Flex
      as="nav"
      bg="black"
      color="white"
      position="fixed"
      top="0"
      left="0"
      right="0"
      align="center"
      justify="space-between"
      px={4}
      py={2}
      zIndex="1000" 
      width="100%"
      boxShadow="md"
    >
      <IconButton
        aria-label="Open menu"
        icon={<FaBars />}
        onClick={onToggleMenu}
        variant="ghost"
        color="white"
        fontSize="24px"
      />
      <Text fontSize="2xl" fontWeight="bold" textAlign="center">
        {mode ? (mode === 'enemy' ? 'Enemy' : 'Ally') : ''} Monitor
      </Text>
      <Spacer />
      <HStack spacing={4}>
        <Select
          value={selectedWorld}
          onChange={handleWorldChange}
          width="150px"
          size="sm"
          variant="filled"
          bg="gray.700"
          color="white"
          _hover={{ bg: "gray.600" }}
        >
          {worlds.map((world) => (
            <option key={world} value={world}>
              {world}
            </option>
          ))}
        </Select>
        {mode && setMode && (
          <HStack>
            <Text fontSize="sm">Aliado</Text>
            <Switch
              colorScheme="red"
              isChecked={mode === 'enemy'}
              onChange={handleModeChange}
            />
            <Text fontSize="sm">Inimigo</Text>
          </HStack>
        )}
        <IconButton
          aria-label="Logout"
          onClick={handleLogout}
          icon={<FaSignOutAlt />}
          variant="ghost"
          color="white"
          fontSize="20px"
        />
      </HStack>
    </Flex>
  );
};

export default Topbar;