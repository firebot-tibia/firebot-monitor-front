import Link from 'next/link';
import { Box, Flex, HStack, Button } from '@chakra-ui/react';
import { config } from '../../config/config';


const Navbar = () => {
  return (
    <Box bg="gray.800" px={4}>
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <HStack spacing={8} alignItems="center">
          <Box color="white">Tornabra Enemy Monitor</Box>
          <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
            {config.nameNavigation.map((navItem, index) => (
              <Link key={index} href={navItem.href} passHref>
                <Button variant="link" color="white">{navItem.name}</Button>
              </Link>
            ))}
          </HStack>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
