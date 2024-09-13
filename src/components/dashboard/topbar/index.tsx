import { Flex, IconButton, Spacer, HStack, Text } from "@chakra-ui/react";
import { FC, useCallback } from "react";
import { FaSignOutAlt, FaBars } from "react-icons/fa";
import { signOut } from "next-auth/react";

interface TopbarProps {
  onToggleMenu: () => void;
}

const Topbar: FC<TopbarProps> = ({ onToggleMenu }) => {
  const clearLocalStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      const domain = 'monitor.firebot.run';
      
      if (window.location.hostname === domain) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            localStorage.removeItem(key);
          }
        }
        console.log('LocalStorage cleared for', domain);
      } else {
        console.log('Not on the target domain. LocalStorage not cleared.');
      }
    }
  }, []);

  const handleLogout = useCallback(() => {
    clearLocalStorage();
    signOut({ redirect: true, callbackUrl: '/' });
  }, [clearLocalStorage]);

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
        Enemy Monitor
      </Text>
      <Spacer />
      <HStack spacing={4}>
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