import { Flex, IconButton, Spacer, HStack, Text } from "@chakra-ui/react";
import { FC } from "react";
import { FaCog, FaSignOutAlt, FaBars } from "react-icons/fa";
import Link from 'next/link';
import { signOut } from "next-auth/react";

interface TopbarProps {
  onToggleMenu: () => void;
}

const Topbar: FC<TopbarProps> = ({ onToggleMenu }) => {
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
