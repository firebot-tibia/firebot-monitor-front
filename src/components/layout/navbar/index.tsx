'use client';
import { useState, useEffect } from 'react';
import { Box, VStack, Button, Icon, Text, Tooltip, useMediaQuery, Flex } from '@chakra-ui/react';
import { FaHome, FaMap, FaDiscord } from "react-icons/fa";
import { IoMdStats } from "react-icons/io";
import { FaOptinMonster } from "react-icons/fa6";
import Link from 'next/link';
import { useTokenStore } from '../../../store/token-decoded-store';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType;
  target?: string;
  requiredStatus?: string[];
}

const navItems: NavItem[] = [
  {
    name: 'Monitorar Guild',
    href: '/home',
    icon: FaHome,
  },
  {
    name: 'Estatísticas da Guild',
    href: '/guild-stats',
    icon: IoMdStats,
  },
  {
    name: 'Respawns',
    href: '/reservations',
    icon: FaOptinMonster,
    requiredStatus: ['admin', 'reservations'],
  },
  {
    name: 'Mapa Exiva',
    href: '/tibia-map',
    icon: FaMap,
  },
  {
    name: 'Suporte no Discord',
    href: 'https://discord.gg/5eUrDejn', 
    icon: FaDiscord,
    target: '_blank',
  },
];

interface NavbarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isOpen, onToggle }) => {
  const [isClient, setIsClient] = useState(false);
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const userStatus = useTokenStore(state => state.userStatus);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  if (isMobile && !isOpen) {
    return null;
  }

  const filteredNavItems = navItems.filter(item => 
    !item.requiredStatus || item.requiredStatus.includes(userStatus)
  );

  return (
    <Box
      as="nav"
      bg="black"
      color="white"
      w={isMobile ? "100%" : isOpen ? "240px" : "60px"}
      pos="fixed"
      top={isMobile ? "0" : "50px"}
      h={isMobile ? "100%" : "calc(100% - 50px)"}
      display="flex"
      flexDirection="column"
      alignItems="center"
      py={4}
      zIndex={1000}
      transition="width 0.3s ease"
    >
      {isMobile && (
        <Button onClick={onToggle} mb={4}>
          Fechar
        </Button>
      )}
      <Flex direction="column" justify="flex-start" align="center" height="100%" width="100%" py={6}>
        <VStack spacing={4} align="center" width="full">
          {filteredNavItems.map((navItem, index) => (
            <Tooltip key={index} label={navItem.name} placement="right" isDisabled={isOpen || isMobile}>
              <Link href={navItem.href} target={navItem.target} passHref>
                <Button
                  as="div"
                  variant="ghost"
                  color="white"
                  w="full"
                  px={2}
                  flexDirection={isMobile || isOpen ? "row" : "column"}
                  justifyContent={isMobile || isOpen ? "flex-start" : "center"}
                  alignItems="center"
                  _hover={{ bg: "whiteAlpha.200" }}
                >
                  <Icon as={navItem.icon} boxSize={6} mb={isMobile || isOpen ? 0 : 2} />
                  {(isOpen || isMobile) && (
                    <Text ml={isMobile || isOpen ? 2 : 0} fontSize="sm">
                      {navItem.name}
                    </Text>
                  )}
                </Button>
              </Link>
            </Tooltip>
          ))}
        </VStack>
      </Flex>
    </Box>
  );
};

export default Navbar;