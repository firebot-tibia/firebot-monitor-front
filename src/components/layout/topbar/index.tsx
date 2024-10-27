import React, { useCallback } from 'react';
import {
  Flex, IconButton, HStack, Text, useDisclosure, Drawer,
  DrawerOverlay, DrawerContent, DrawerBody, VStack, Tooltip,
  useColorModeValue, Box, Icon, Link,
  Image
} from "@chakra-ui/react";
import { FaSignOutAlt, FaBars, FaCog, FaDiscord } from "react-icons/fa";
import { FaHome, FaMap } from "react-icons/fa";
import { IoMdStats } from "react-icons/io";
import { FaOptinMonster } from "react-icons/fa6";
import { signOut } from "next-auth/react";
import NextLink from 'next/link';
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
];

const Topbar = () => {
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
        <Flex align="center">
          <Text fontSize="xl" fontWeight="bold" mr={2}>
            Firebot Monitor
          </Text>
          <Tooltip label="Suporte no Discord">
            <Link href="https://discord.gg/2uYKmHNmHP" isExternal>
              <Icon as={FaDiscord} fontSize="24px" color={textColor} />
            </Link>
          </Tooltip>
        </Flex>
        <HStack spacing={2}>
          <WorldSelect />
          <ModeSelect />
          <Tooltip label="Settings">
            <IconButton
              as={NextLink}
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
            <Image src="/assets/logo.png" alt="Firebot Monitor" boxSize="120px" mr={2} />
              {filteredNavItems.map((item, index) => (
                <NextLink key={index} href={item.href} passHref>
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
                    target={item.target}
                  >
                    <Icon as={item.icon} mr={3} fontSize="16px" />
                    {item.name}
                  </Flex>
                </NextLink>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Topbar;