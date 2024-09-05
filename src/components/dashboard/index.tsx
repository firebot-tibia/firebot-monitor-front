'use client';

import { Box, Flex, useDisclosure } from "@chakra-ui/react";
import { FC } from "react";
import Navbar from "./navbar";
import Topbar from "./topbar";

const DashboardLayout: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });

  return (
    <Flex direction="column" h="100vh">
      <Topbar />
      <Flex flex="1">
        <Navbar isOpen={isOpen} onToggle={onToggle} />
        <Box 
          ml={isOpen ? "240px" : "60px"} 
          p={12} 
          w={`calc(100% - ${isOpen ? "240px" : "60px"})`}
          transition="margin-left 0.3s ease, width 0.3s ease"
        >
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default DashboardLayout;