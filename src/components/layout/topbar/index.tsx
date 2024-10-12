import { Flex, IconButton, Spacer, HStack, Text, Switch } from "@chakra-ui/react";
import { FC, useCallback } from "react";
import { FaSignOutAlt, FaBars } from "react-icons/fa";
import { signOut } from "next-auth/react";
import { clearLocalStorage } from "../../../shared/utils/utils";
import WorldSelect from "../world-select";
import { useTokenStore } from "../../../store/token-decoded-store";

interface TopbarProps {
  onToggleMenu: () => void;
}

const Topbar: FC<TopbarProps> = ({ onToggleMenu }) => {
  const { mode, setMode } = useTokenStore();

  const handleLogout = useCallback(() => {
    clearLocalStorage();
    signOut({ redirect: true, callbackUrl: '/' });
  }, []);

  const handleModeChange = useCallback(() => {
    clearLocalStorage();
    const newMode = mode === 'ally' ? 'enemy' : 'ally';
    setMode(newMode);
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
        Firebot Monitor
      </Text>
      <Spacer />
      <HStack spacing={4}>
        <WorldSelect />
        <HStack>
          <Text fontSize="sm">Aliado</Text>
          <Switch
            colorScheme="red"
            isChecked={mode === 'enemy'}
            onChange={handleModeChange}
          />
          <Text fontSize="sm">Inimigo</Text>
        </HStack>
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