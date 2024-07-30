'use client';

import { useEffect, useState } from 'react';
import { Box, VStack, Button, Icon, Text } from '@chakra-ui/react';
import { FaHome } from 'react-icons/fa';
import Link from 'next/link';
import { config } from '../../../config/config';

const Navbar = () => {
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
      w={{ base: "full", md: 60 }}
      pos="fixed"
      h="full"
      display="flex"
      flexDirection="column"
      alignItems="center"
      py={4}
    >
      <Box mb={8}>
        <Text fontSize="2xl" fontWeight="bold" textAlign="center">
          Enemy Monitor
        </Text>
      </Box>
      <VStack spacing={4}>
        {config.nameNavigation.map((navItem, index) => (
          <Link key={index} href={navItem.href} passHref>
            <Button
              as="div"
              variant="ghost"
              color="white"
              leftIcon={<Icon as={navItem.icon || FaHome} />}
              w="full"
              justifyContent="start"
              pl={6}
            >
              {navItem.name}
            </Button>
          </Link>
        ))}
      </VStack>
    </Box>
  );
};

export default Navbar;
