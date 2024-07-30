import { Flex, IconButton, Spacer, HStack } from "@chakra-ui/react";
import { FC } from "react";
import { FaCog, FaSignOutAlt } from "react-icons/fa";
import Link from 'next/link';
import WorldSelector from "./world-selector";

const Topbar: FC = () => {
  return (
    <Flex
      as="nav"
      bg="black"
      color="white"
      align="center"
      justify="space-between"
      px={4}
      py={2}
      boxShadow="md"
    >
      <Spacer />
      <HStack spacing={4}>
      <WorldSelector />
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
        <Link href="/logout" passHref>
          <IconButton
            aria-label="Logout"
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
