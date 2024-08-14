import { Flex, IconButton, Spacer, HStack, Text } from "@chakra-ui/react";
import { FC } from "react";
import { FaCog, FaSignOutAlt } from "react-icons/fa";
import Link from 'next/link';
import { signOut } from "next-auth/react";

const Topbar: FC = () => {
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
      <Text fontSize="2xl" fontWeight="bold" textAlign="center">
        Enemy Monitor
      </Text>
      <Spacer />
      <HStack spacing={4}>
        <Link href="/settings" passHref>
          <IconButton
            aria-label="Settings"
            icon={<FaCog />}
            variant="ghost"
            color="white"
            fontSize="20px"
            as="div"
          />
        </Link>
        <Link href="#" passHref>
          <IconButton
            aria-label="Logout"
            onClick={() => { signOut({ redirect: true, callbackUrl: '/' }) }}
            icon={<FaSignOutAlt />}
            variant="ghost"
            color="white"
            fontSize="20px"
            as="div"
          />
        </Link>
      </HStack>
    </Flex>
  );
};

export default Topbar;
