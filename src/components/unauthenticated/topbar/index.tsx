import {
  Flex,
  Text,
  Tooltip,
  useColorModeValue,
  Box,
  Icon,
  Link,
  Button,
} from "@chakra-ui/react";
import { FaDiscord, FaSignInAlt } from "react-icons/fa";
import NextLink from 'next/link';

const UnauthenticatedTopbar = () => {
  const bgColor = useColorModeValue('red.800', 'red.900');
  const textColor = useColorModeValue('white', 'gray.100');

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

        <Tooltip label="Login">
          <Button
            as={NextLink}
            href="/"
            leftIcon={<FaSignInAlt />}
            variant="ghost"
            color={textColor}
            fontSize="16px"
            _hover={{
              bg: 'whiteAlpha.200'
            }}
          >
            Login
          </Button>
        </Tooltip>
      </Flex>
    </Box>
  );
};

export default UnauthenticatedTopbar;