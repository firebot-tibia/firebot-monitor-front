import { Flex, IconButton, Spacer, HStack, Text, Switch } from "@chakra-ui/react";
import { FC, useCallback } from "react";
import { FaSignOutAlt, FaBars } from "react-icons/fa";
import { signOut } from "next-auth/react";
import { clearLocalStorage } from "../../../shared/utils/utils";

interface TopbarProps {
  onToggleMenu: () => void;
  mode?: 'ally' | 'enemy';
  setMode?: (mode: 'ally' | 'enemy') => void;
}

const Topbar: FC<TopbarProps> = ({ onToggleMenu, mode, setMode }) => {
  const handleLogout = useCallback(() => {
    clearLocalStorage();
    signOut({ redirect: true, callbackUrl: '/' });
  }, []);

  const handleModeChange = useCallback(() => {
    if (setMode && mode) {
      setMode(mode === 'ally' ? 'enemy' : 'ally');
    }
  }, [mode, setMode]);

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