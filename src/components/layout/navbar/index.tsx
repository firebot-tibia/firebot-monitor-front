'use client';
import { useState, useEffect } from 'react';
import { Box, VStack, Button, Icon, Text, Tooltip, useMediaQuery, Flex } from '@chakra-ui/react';
import { FaHome } from 'react-icons/fa';
import Link from 'next/link';
import { config } from '../../../config/config';

interface NavbarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isOpen, onToggle }) => {
  const [isClient, setIsClient] = useState(false);
  const [isMobile] = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  if (isMobile && !isOpen) {
    return null;
  }

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
    >
      {isMobile && (
        <Button onClick={onToggle} mb={4}>
          Fechar
        </Button>
      )}
      <Flex direction="column" justify={"flex-start"} align="center" height="100%" width="100%" py={6}>
        <VStack spacing={4} align="center" width="full">
          {config.nameNavigation.map((navItem, index) => (
            <Tooltip key={index} label={navItem.name} placement="right" isDisabled={isOpen || isMobile}>
              <Link href={navItem.href} target={navItem.target} passHref>
                <Button
                  as="div"
                  variant="ghost"
                  color="white"
                  w="full"
                  px={2}
                  flexDirection={isMobile || isOpen ? "row" : "column"}
                  justifyContent={"flex-start"}
                  alignItems="center"
                >
                  <Icon as={navItem.icon || FaHome} mb={isMobile || isOpen ? 0 : 2} />
                  {(isOpen || isMobile) && (
                    <Text ml={isMobile || isOpen ? 2 : 0} textAlign={isMobile ? "center" : "left"}>
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