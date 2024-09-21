'use client';

import { useState, useEffect } from 'react';
import { Box, VStack, Button, Icon, Text, Center, Image, Tooltip, Flex } from '@chakra-ui/react';
import { FaHome, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';
import { config } from '../../../config/config';

interface NavbarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isOpen, onToggle }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <Box
      as="nav"
      bg="black"
      color="white"
      w={isOpen ? "240px" : "60px"}
      pos="fixed"
      top="50px"
      h="calc(100% - 50px)"
      display="flex"
      flexDirection="column"
      alignItems="center"
      py={4}
    >
      {isOpen && (
        <Center mb={8}>
          <Image src="assets/logo.png" alt="Logo" maxW="30%" />
        </Center>
      )}
      <VStack spacing={4} align="stretch" width="full">
        {config.nameNavigation.map((navItem, index) => (
          <Tooltip key={index} label={navItem.name} placement="right" isDisabled={isOpen}>
            <Link href={navItem.href} target={navItem.target} passHref>
              <Button
                as="div"
                variant="ghost"
                color="white"
                leftIcon={<Icon as={navItem.icon || FaHome} />}
                w="full"
                justifyContent={isOpen ? "center" : "center"}
                px={2}
              >
                {isOpen && <Text textAlign="center">{navItem.name}</Text>}
              </Button>
            </Link>
          </Tooltip>
        ))}
      </VStack>
    </Box>
  );
};
