import React, {useCallback } from 'react';
import { 
  Flex, IconButton, HStack, Text, useDisclosure, Drawer, 
  DrawerOverlay, DrawerContent, DrawerBody, VStack, Tooltip, 
  useColorModeValue, Box,
  Icon
} from "@chakra-ui/react";
import { FaSignOutAlt, FaBars, FaCog } from "react-icons/fa";
import { FaHome, FaMap, FaDiscord } from "react-icons/fa";
import { IoMdStats } from "react-icons/io";
import { FaOptinMonster } from "react-icons/fa6";
import { signOut } from "next-auth/react";
import Link from 'next/link';
import { clearLocalStorage } from "../../../shared/utils/utils";
import WorldSelect from "../world-select";
import ModeSelect from "../mode-select";
import { useTokenStore } from '../../../store/token-decoded-store';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType;
  target?: string;
  requiredStatus?: string[];
}

const navItems: NavItem[] = [
  { name: 'Monitorar Guild', href: '/home', icon: FaHome },
  { name: 'Estatísticas da Guild', href: '/guild-stats', icon: IoMdStats },
  { name: 'Respawns', href: '/reservations', icon: FaOptinMonster, requiredStatus: ['admin', 'reservations'] },
  { name: 'Mapa Exiva', href: '/tibia-map', icon: FaMap },
  { name: 'Suporte no Discord', href: 'https://discord.gg/5eUrDejn', icon: FaDiscord, target: '_blank' },
];

const Layout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const userStatus = useTokenStore(state => state.userStatus);
  const bgColor = useColorModeValue('red.800', 'red.900');
  const textColor = useColorModeValue('white', 'gray.100');

  const handleLogout = useCallback(() => {
    clearLocalStorage();
    signOut({ redirect: true, callbackUrl: '/' });
  }, []);

  const filteredNavItems = navItems.filter(item =>
    !item.requiredStatus || item.requiredStatus.includes(userStatus)
  );

  return (
    <Box>
      <Flex
        as="header"
        bg={bgColor}
        color={textColor}
        align="center"
        justify="space-between"
        px={4}
        py={2}
        boxShadow="md"
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={1000}
      >
        <IconButton
          aria-label="Open menu"
          icon={<FaBars />}
          onClick={onOpen}
          variant="ghost"
          color={textColor}
          fontSize="20px"
        />
        <Text fontSize="xl" fontWeight="bold">
          Firebot Monitor
        </Text>
        <HStack spacing={2}>
          <WorldSelect />
          <ModeSelect />
          <Tooltip label="Settings">
            <IconButton
              as={Link}
              href="/settings"
              aria-label="Settings"
              icon={<FaCog />}
              variant="ghost"
              color={textColor}
              fontSize="20px"
            />
          </Tooltip>
          <Tooltip label="Logout">
            <IconButton
              aria-label="Logout"
              onClick={handleLogout}
              icon={<FaSignOutAlt />}
              variant="ghost"
              color={textColor}
              fontSize="20px"
            />
          </Tooltip>
        </HStack>
      </Flex>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent bg={bgColor} color={textColor}>
          <DrawerBody p={0}>
            <VStack spacing={0} align="stretch">
              {filteredNavItems.map((item, index) => (
                <Link key={index} href={item.href} passHref>
                  <Flex
                    as="a"
                    align="center"
                    p={3}
                    fontSize="sm"
                    fontWeight="medium"
                    borderRadius="md"
                    role="group"
                    cursor="pointer"
                    _hover={{
                      bg: 'whiteAlpha.100',
                    }}
                    onClick={onClose}
                  >
                    <Icon as={item.icon} mr={3} fontSize="16px" />
                    {item.name}
                  </Flex>
                </Link>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Layout;